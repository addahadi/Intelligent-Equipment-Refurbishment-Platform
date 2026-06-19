import { toNumber } from './helpers.js';

// Public profile shape — never includes mot_de_passe_hash.
// Clients additionally carry favoris[] / commandes[] when the service supplies them.
export function toProfil(row, { favoris, commandes } = {}) {
  const base = {
    id: toNumber(row.id),
    nom: row.nom,
    email: row.email,
    role: row.role,
  };

  if (row.role === 'CLIENT') {
    return {
      ...base,
      telephone: row.telephone ?? undefined,
      adresse: row.adresse ?? undefined,
      favoris: favoris ?? [],
      commandes: commandes ?? [],
    };
  }

  return base;
}
