import sql from '../config/database.js';
import AppError from '../utils/AppError.js';
import { toOffre } from './mappers/offre.mapper.js';
import { toComposant } from './mappers/composant.mapper.js';

// FR-17 — public submission. Entreprise captured per submission (not deduped),
// so entreprise + offre are created together atomically.
export async function submit(body, lang) {
  return sql.begin(async (tx) => {
    const [entreprise] = await tx`
      insert into entreprise (nom, contact, adresse)
      values (${body.entreprise.nom}, ${body.entreprise.contact}, ${body.entreprise.adresse ?? null})
      returning *
    `;

    const cols = {
      entreprise_id: entreprise.id,
      categorie_id: body.categorieId ?? null,
      designation_fr: body.designation,
      designation_ar: body.designationAr ?? null,
      type_propose: body.typePropose,
      marque: body.marque ?? null,
      modele: body.modele ?? null,
      reference: body.reference ?? null,
      etat_declare: body.etatDeclare,
      prix_propose: body.prixPropose,
      images: body.images ?? [],
      description_fr: body.description ?? null,
      description_ar: body.descriptionAr ?? null,
    };
    const [row] = await tx`insert into offre ${tx(cols)} returning *`;
    return toOffre(row, lang);
  });
}

export async function list(filters, lang) {
  const { statut } = filters;
  const where = statut ? sql`where o.statut = ${statut}` : sql``;
  // Join the entreprise so the admin review panel can show name/contact/address.
  const rows = await sql`
    select o.*,
           e.nom     as entreprise_nom,
           e.contact as entreprise_contact,
           e.adresse as entreprise_adresse
    from offre o
    join entreprise e on e.id = o.entreprise_id
    ${where}
    order by o.date_offre desc, o.id desc
  `;
  return rows.map((r) => toOffre(r, lang));
}

// FR-22 — accept: create an EN_RECONDITIONNEMENT composant pre-filled from the
// offer, flip the offer to ACCEPTEE, and link them.
export async function accepter(offreId, lang) {
  const [offre] = await sql`select * from offre where id = ${offreId}`;
  if (!offre) throw AppError.notFound('Offre introuvable.');
  if (offre.statut !== 'EN_ATTENTE') {
    throw AppError.conflict('Cette offre a déjà été traitée.');
  }

  return sql.begin(async (tx) => {
    const cols = {
      type_composant: offre.type_propose,
      nom_fr: offre.designation_fr,
      nom_ar: offre.designation_ar,
      // composant.reference is NOT NULL unique; fall back when the offer had none.
      reference: offre.reference || `OFFRE-${offre.id}`,
      marque: offre.marque,
      modele: offre.modele,
      categorie_id: offre.categorie_id,
      qualite: 'BON',
      prix: 0,
      garantie: 12,
      images: offre.images ?? [],
      description_fr: offre.description_fr,
      description_ar: offre.description_ar,
      etat_actuel: 'EN_RECONDITIONNEMENT',
      offre_id: offre.id,
    };
    const [composant] = await tx`insert into composant ${tx(cols)} returning *`;
    await tx`
      update offre set statut = 'ACCEPTEE', composant_id = ${composant.id} where id = ${offreId}
    `;
    return toComposant(composant, lang);
  });
}

export async function rejeter(offreId, lang) {
  const [row] = await sql`
    update offre set statut = 'REJETEE' where id = ${offreId} returning *
  `;
  if (!row) throw AppError.notFound('Offre introuvable.');
  return toOffre(row, lang);
}
