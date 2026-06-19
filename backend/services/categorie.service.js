import sql from '../config/database.js';
import AppError from '../utils/AppError.js';
import { toCategorie } from './mappers/categorie.mapper.js';

export async function list(lang) {
  const rows = await sql`select * from categorie order by id`;
  return rows.map((r) => toCategorie(r, lang));
}

export async function create({ libelle, libelleAr }, lang) {
  // libelle_fr + libelle_ar are both NOT NULL — duplicate when Arabic is absent.
  const ar = libelleAr ?? libelle;
  const [row] = await sql`
    insert into categorie (libelle_fr, libelle_ar)
    values (${libelle}, ${ar})
    returning *
  `;
  return toCategorie(row, lang);
}

export async function remove(id) {
  const rows = await sql`delete from categorie where id = ${id} returning id`;
  if (!rows.length) throw AppError.notFound('Catégorie introuvable.');
}
