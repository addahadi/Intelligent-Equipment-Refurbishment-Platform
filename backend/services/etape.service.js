import sql from '../config/database.js';
import AppError from '../utils/AppError.js';
import { toEtape } from './mappers/etape.mapper.js';
import { lockComposant, writeAudit } from './sold-guard.js';

export async function list(composantId, lang) {
  const rows = await sql`
    select * from etape_tracabilite where composant_id = ${composantId} order by ordre
  `;
  return rows.map((r) => toEtape(r, lang));
}

// FR-26..31 add a step; FR-33 derives etat_actuel for terminal step types.
// `ctx` = { override, motif, profilId } — a VENDU composant is frozen unless
// ctx.override (+ motif) is supplied, in which case the edit is audited.
export async function create(composantId, body, lang, ctx = {}) {
  return sql.begin(async (tx) => {
    const { sold } = await lockComposant(tx, composantId, ctx);

    // Default ordre to the next slot when the caller doesn't specify one.
    let { ordre } = body;
    if (ordre == null) {
      const [{ next }] = await tx`
        select coalesce(max(ordre), 0) + 1 as next
        from etape_tracabilite where composant_id = ${composantId}
      `;
      ordre = Number(next);
    }

    const cols = {
      composant_id: composantId,
      type: body.type,
      ordre,
      description_fr: body.description ?? null,
      description_ar: body.descriptionAr ?? null,
    };
    if (body.date) cols.date = body.date;

    const [row] = await tx`insert into etape_tracabilite ${tx(cols)} returning *`;

    if (body.type === 'MISE_EN_VENTE') {
      await tx`
        update composant set etat_actuel = 'EN_VENTE', date_publication = ${row.date}
        where id = ${composantId}
      `;
    } else if (body.type === 'RECYCLAGE') {
      await tx`update composant set etat_actuel = 'RECYCLE' where id = ${composantId}`;
    }

    if (sold) {
      await writeAudit(tx, {
        composantId,
        profilId: ctx.profilId,
        operation: 'ETAPE_CREATE',
        motif: ctx.motif,
        before: null,
        after: row,
      });
    }

    return toEtape(row, lang);
  });
}

export async function update(etapeId, body, lang, ctx = {}) {
  const cols = {};
  if (body.type !== undefined) cols.type = body.type;
  if (body.ordre !== undefined) cols.ordre = body.ordre;
  if (body.date !== undefined) cols.date = body.date;
  if (body.description !== undefined) cols.description_fr = body.description;
  if (body.descriptionAr !== undefined) cols.description_ar = body.descriptionAr;

  if (Object.keys(cols).length === 0) {
    const [row] = await sql`select * from etape_tracabilite where id = ${etapeId}`;
    if (!row) throw AppError.notFound('Étape introuvable.');
    return toEtape(row, lang);
  }

  return sql.begin(async (tx) => {
    const [before] = await tx`select * from etape_tracabilite where id = ${etapeId}`;
    if (!before) throw AppError.notFound('Étape introuvable.');

    const { sold } = await lockComposant(tx, before.composant_id, ctx);

    const [row] = await tx`update etape_tracabilite set ${tx(cols)} where id = ${etapeId} returning *`;

    if (sold) {
      await writeAudit(tx, {
        composantId: before.composant_id,
        profilId: ctx.profilId,
        operation: 'ETAPE_UPDATE',
        motif: ctx.motif,
        before,
        after: row,
      });
    }
    return toEtape(row, lang);
  });
}

export async function remove(etapeId, ctx = {}) {
  return sql.begin(async (tx) => {
    const [before] = await tx`select * from etape_tracabilite where id = ${etapeId}`;
    if (!before) throw AppError.notFound('Étape introuvable.');

    const { sold } = await lockComposant(tx, before.composant_id, ctx);

    await tx`delete from etape_tracabilite where id = ${etapeId}`;

    if (sold) {
      await writeAudit(tx, {
        composantId: before.composant_id,
        profilId: ctx.profilId,
        operation: 'ETAPE_DELETE',
        motif: ctx.motif,
        before,
        after: null,
      });
    }
  });
}

// Swap a step's ordre with its neighbour. unique(composant_id, ordre) forbids a
// direct two-row swap, so we park one row at a free temp slot (the temp-value dance).
export async function reorder(etapeId, direction, lang, ctx = {}) {
  return sql.begin(async (tx) => {
    const [target] = await tx`select * from etape_tracabilite where id = ${etapeId}`;
    if (!target) throw AppError.notFound('Étape introuvable.');

    const { sold } = await lockComposant(tx, target.composant_id, ctx);

    const siblings = await tx`
      select * from etape_tracabilite where composant_id = ${target.composant_id} order by ordre
    `;
    const idx = siblings.findIndex((e) => Number(e.id) === Number(etapeId));
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) {
      return siblings.map((r) => toEtape(r, lang)); // no-op at the boundary
    }

    const a = siblings[idx];
    const b = siblings[swapIdx];
    const temp = Number(siblings[siblings.length - 1].ordre) + 1; // free, >= 0

    await tx`update etape_tracabilite set ordre = ${temp} where id = ${a.id}`;
    await tx`update etape_tracabilite set ordre = ${a.ordre} where id = ${b.id}`;
    await tx`update etape_tracabilite set ordre = ${b.ordre} where id = ${a.id}`;

    const final = await tx`
      select * from etape_tracabilite where composant_id = ${target.composant_id} order by ordre
    `;

    if (sold) {
      await writeAudit(tx, {
        composantId: target.composant_id,
        profilId: ctx.profilId,
        operation: 'ETAPE_REORDER',
        motif: ctx.motif,
        before: siblings.map((e) => ({ id: Number(e.id), ordre: Number(e.ordre) })),
        after: final.map((e) => ({ id: Number(e.id), ordre: Number(e.ordre) })),
      });
    }

    return final.map((r) => toEtape(r, lang));
  });
}
