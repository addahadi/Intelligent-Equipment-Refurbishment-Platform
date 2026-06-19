import { pick } from '../../utils/lang.js';
import { toNumber, toDateString } from './helpers.js';

export function toOffre(row, lang = 'fr') {
  return {
    id: toNumber(row.id),
    designation: pick(row.designation_fr, row.designation_ar, lang),
    typePropose: row.type_propose,
    marque: row.marque ?? '',
    modele: row.modele ?? '',
    reference: row.reference ?? '',
    categorieId: toNumber(row.categorie_id),
    etatDeclare: row.etat_declare,
    prixPropose: row.prix_propose == null ? 0 : Number(row.prix_propose),
    description: pick(row.description_fr, row.description_ar, lang) ?? undefined,
    images: row.images ?? [],
    dateOffre: toDateString(row.date_offre),
    statut: row.statut,
    entrepriseId: toNumber(row.entreprise_id),
    composantId: toNumber(row.composant_id) ?? undefined,
  };
}
