import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from '../config/database.js';
import env from '../config/env.js';
import AppError from '../utils/AppError.js';
import { toProfil } from './mappers/profil.mapper.js';

function signToken(profil) {
  return jwt.sign({ id: Number(profil.id), role: profil.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

// Client-only lists attached to a CLIENT profile.
async function clientLists(clientId) {
  const [favoris, commandes] = await Promise.all([
    sql`select composant_id from favori where client_id = ${clientId}`,
    sql`select id from commande where client_id = ${clientId}`,
  ]);
  return {
    favoris: favoris.map((r) => Number(r.composant_id)),
    commandes: commandes.map((r) => Number(r.id)),
  };
}

export async function register({ nom, email, password, telephone, adresse }) {
  const hash = await bcrypt.hash(password, 10);
  const existing = await sql`select 1 from profil where email = ${email}`;
  if (existing.length) throw AppError.conflict('Cet email est déjà utilisé.');

  const [row] = await sql`
    insert into profil (role, nom, email, mot_de_passe_hash, telephone, adresse)
    values ('CLIENT', ${nom}, ${email}, ${hash}, ${telephone ?? null}, ${adresse ?? null})
    returning *
  `;
  const profil = toProfil(row, { favoris: [], commandes: [] });
  return { token: signToken(row), user: profil };
}

export async function login({ email, password }) {
  const [row] = await sql`select * from profil where email = ${email}`;
  if (!row) throw AppError.unauthenticated('Email ou mot de passe incorrect.');

  const ok = await bcrypt.compare(password, row.mot_de_passe_hash);
  if (!ok) throw AppError.unauthenticated('Email ou mot de passe incorrect.');

  const lists = row.role === 'CLIENT' ? await clientLists(row.id) : {};
  return { token: signToken(row), user: toProfil(row, lists) };
}

export async function getMe(userId) {
  const [row] = await sql`select * from profil where id = ${userId}`;
  if (!row) throw AppError.notFound('Profil introuvable.');
  const lists = row.role === 'CLIENT' ? await clientLists(row.id) : {};
  return toProfil(row, lists);
}
