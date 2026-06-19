import sql from '../config/database.js';

// FR-34 admin dashboard metrics. Every enum bucket is zero-filled so the
// frontend can read each key unconditionally.
export async function dashboard() {
  const [offreRows, invRows, revenuRows] = await Promise.all([
    sql`select statut, count(*)::int as n from offre group by statut`,
    sql`select etat_actuel, count(*)::int as n from composant group by etat_actuel`,
    sql`select coalesce(sum(prix), 0)::float as revenu from commande where statut = 'CONFIRMEE'`,
  ]);

  const offres = { EN_ATTENTE: 0, ACCEPTEE: 0, REJETEE: 0 };
  offreRows.forEach((r) => { offres[r.statut] = Number(r.n); });

  const inventaire = { EN_RECONDITIONNEMENT: 0, EN_VENTE: 0, VENDU: 0, RECYCLE: 0 };
  invRows.forEach((r) => { inventaire[r.etat_actuel] = Number(r.n); });

  return {
    offres,
    inventaire,
    revenuSimule: Number(revenuRows[0].revenu),
    enVente: inventaire.EN_VENTE,
  };
}
