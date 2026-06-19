import sql from '../config/database.js';
import { toCommande } from './mappers/commande.mapper.js';

// Clients see their own orders; admins see all (FR-15/16).
export async function list(user) {
  const rows =
    user.role === 'ADMINISTRATEUR'
      ? await sql`select * from commande order by date desc, id desc`
      : await sql`select * from commande where client_id = ${user.id} order by date desc, id desc`;
  return rows.map(toCommande);
}
