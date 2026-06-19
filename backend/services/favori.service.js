import sql from '../config/database.js';
import { toComposant } from './mappers/composant.mapper.js';

// FR-10 — the client's favourite composants (full objects for the favoris page;
// /auth/me already exposes the id list).
export async function list(clientId, lang) {
  const rows = await sql`
    select c.* from favori f
    join composant c on c.id = f.composant_id
    where f.client_id = ${clientId}
    order by f.created_at desc
  `;
  return rows.map((r) => toComposant(r, lang));
}

export async function add(clientId, composantId) {
  await sql`
    insert into favori (client_id, composant_id)
    values (${clientId}, ${composantId})
    on conflict (client_id, composant_id) do nothing
  `;
}

export async function remove(clientId, composantId) {
  await sql`
    delete from favori where client_id = ${clientId} and composant_id = ${composantId}
  `;
}
