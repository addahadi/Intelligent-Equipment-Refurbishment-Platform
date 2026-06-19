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
    // Present only on the admin list (joined query).
    client: row.client_nom ? { nom: row.client_nom, email: row.client_email } : undefined,
    composant: row.composant_nom
      ? {
          nom: row.composant_nom,
          reference: row.composant_reference,
          garantie: row.composant_garantie ?? 0,
        }
      : undefined,
  };
}
