import sql from '../config/database.js';
import { toCommande } from './mappers/commande.mapper.js';

// Clients see their own orders (bare rows); admins see all, with the buyer
// and item embedded for the sales console.
export async function list(user) {
  if (user.role === 'ADMINISTRATEUR') {
    const rows = await sql`
      select c.*,
             p.nom         as client_nom,
             p.email       as client_email,
             comp.nom_fr   as composant_nom,
             comp.reference as composant_reference,
             comp.garantie as composant_garantie
      from commande c
      join profil p on p.id = c.client_id
      join composant comp on comp.id = c.composant_id
      order by c.date desc, c.id desc
    `;
    return rows.map(toCommande);
  }
  const rows = await sql`
    select * from commande where client_id = ${user.id} order by date desc, id desc
  `;
  return rows.map(toCommande);
}
