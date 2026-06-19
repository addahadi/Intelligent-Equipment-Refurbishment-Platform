import { toNumber, toDateString } from './helpers.js';

export function toCommande(row) {
  return {
    id: toNumber(row.id),
    clientId: toNumber(row.client_id),
    composantId: toNumber(row.composant_id),
    date: toDateString(row.date),
    prix: row.prix == null ? 0 : Number(row.prix),
    statut: row.statut,
    dateFinGarantie: toDateString(row.date_fin_garantie),
  };
}
