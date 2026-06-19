import sql from '../config/database.js';
import AppError from '../utils/AppError.js';
import { toComposant } from './mappers/composant.mapper.js';
import { toCommande } from './mappers/commande.mapper.js';

// Map a validated payload to DB columns. Only type-appropriate STI columns are
// written so the chk_organe_fields / chk_piece_fields constraints never fire.
// `partial` = true builds a column set containing only the provided keys (PATCH).
function buildColumns(body, { partial }) {
  const cols = {};
  const set = (col, val) => {
    cols[col] = val === undefined ? null : val;
  };
  const has = (key) => Object.prototype.hasOwnProperty.call(body, key);
  const maybe = (key, col, val) => {
    if (!partial || has(key)) set(col, val);
  };

  maybe('typeComposant', 'type_composant', body.typeComposant);
  maybe('nom', 'nom_fr', body.nom);
  maybe('nomAr', 'nom_ar', body.nomAr);
  maybe('reference', 'reference', body.reference);
  maybe('marque', 'marque', body.marque);
  maybe('modele', 'modele', body.modele);
  maybe('categorieId', 'categorie_id', body.categorieId);
  maybe('qualite', 'qualite', body.qualite);
  maybe('prix', 'prix', body.prix);
  maybe('garantie', 'garantie', body.garantie);
  maybe('images', 'images', body.images);
  maybe('description', 'description_fr', body.description);
  maybe('descriptionAr', 'description_ar', body.descriptionAr);
  maybe('etatActuel', 'etat_actuel', body.etatActuel);
  maybe('datePublication', 'date_publication', body.datePublication);
  maybe('offreId', 'offre_id', body.offreId);
  maybe('parentOrganeId', 'organe_parent_id', body.parentOrganeId);

  // STI: write only the branch matching the (effective) type.
  const type = body.typeComposant;
  if (type === 'ORGANE' || (partial && (has('typeEquipement') || has('typeEquipementAr')))) {
    maybe('typeEquipement', 'type_equipement_fr', body.typeEquipement);
    maybe('typeEquipementAr', 'type_equipement_ar', body.typeEquipementAr);
  }
  if (type === 'PIECE' || (partial && (has('materiau') || has('compatibilite')))) {
    maybe('materiau', 'materiau_fr', body.materiau);
    maybe('materiauAr', 'materiau_ar', body.materiauAr);
    maybe('compatibilite', 'compatibilite_fr', body.compatibilite);
    maybe('compatibiliteAr', 'compatibilite_ar', body.compatibiliteAr);
  }

  return cols;
}

export async function list(filters, lang) {
  const { etat, search, categorieId, type, marque, qualite, prixMin, prixMax, sort } = filters;

  const conds = [];
  if (etat) conds.push(sql`etat_actuel = ${etat}`);
  if (categorieId) conds.push(sql`categorie_id = ${categorieId}`);
  if (type) conds.push(sql`type_composant = ${type}`);
  if (marque) conds.push(sql`marque = ${marque}`);
  if (qualite) conds.push(sql`qualite = ${qualite}`);
  if (prixMin != null) conds.push(sql`prix >= ${prixMin}`);
  if (prixMax != null) conds.push(sql`prix <= ${prixMax}`);
  if (search) conds.push(sql`search_vector @@ websearch_to_tsquery('simple', ${search})`);

  const where = conds.length
    ? conds.slice(1).reduce((acc, c) => sql`${acc} and ${c}`, sql`where ${conds[0]}`)
    : sql``;

  const order =
    sort === 'prix_asc'
      ? sql`order by prix asc, id desc`
      : sort === 'prix_desc'
        ? sql`order by prix desc, id desc`
        : sql`order by date_publication desc nulls last, id desc`;

  const rows = await sql`select * from composant ${where} ${order} limit 200`;
  return rows.map((r) => toComposant(r, lang));
}

export async function getById(id, lang) {
  const [row] = await sql`select * from composant where id = ${id}`;
  if (!row) throw AppError.notFound('Composant introuvable.');
  return toComposant(row, lang);
}

export async function create(body, lang) {
  const cols = buildColumns(body, { partial: false });
  const [row] = await sql`insert into composant ${sql(cols)} returning *`;
  return toComposant(row, lang);
}

export async function update(id, body, lang) {
  const cols = buildColumns(body, { partial: true });
  if (Object.keys(cols).length === 0) return getById(id, lang);
  const [row] = await sql`update composant set ${sql(cols)} where id = ${id} returning *`;
  if (!row) throw AppError.notFound('Composant introuvable.');
  return toComposant(row, lang);
}

// FR-13/14 — purchase through the stored function (row lock + state flip).
// Its 'Cet article vient d'être vendu' exception surfaces as P0001 → 409.
export async function acheter(composantId, clientId) {
  const [row] = await sql`select * from acheter_composant(${clientId}, ${composantId})`;
  return toCommande(row);
}

// FR-32 — declare salvageable child pieces under a parent organe.
export async function declarePieces(parentId, pieces, lang) {
  const [parent] = await sql`select id, nom_fr from composant where id = ${parentId}`;
  if (!parent) throw AppError.notFound('Organe parent introuvable.');

  return sql.begin(async (tx) => {
    const created = [];
    for (const p of pieces) {
      const cols = buildColumns(
        { ...p, typeComposant: 'PIECE', etatActuel: 'EN_RECONDITIONNEMENT', parentOrganeId: parentId },
        { partial: false },
      );
      const [row] = await tx`insert into composant ${tx(cols)} returning *`;
      await tx`
        insert into etape_tracabilite (composant_id, type, ordre, description_fr)
        values (${row.id}, 'NETTOYAGE', 1, ${`Issue de la décomposition de ${parent.nom_fr}`})
      `;
      created.push(toComposant(row, lang));
    }
    return created;
  });
}
