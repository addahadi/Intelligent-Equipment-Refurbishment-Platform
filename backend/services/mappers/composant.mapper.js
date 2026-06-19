import { pick } from '../../utils/lang.js';
import { toNumber, toDateString } from './helpers.js';

// Single-Table-Inheritance split: emit the frontend Organe | Piece shape,
// dropping the columns that don't belong to the row's type_composant.
export function toComposant(row, lang = 'fr') {
  const base = {
    id: toNumber(row.id),
    nom: pick(row.nom_fr, row.nom_ar, lang),
    reference: row.reference,
    marque: row.marque ?? '',
    modele: row.modele ?? '',
    categorieId: toNumber(row.categorie_id),
    typeComposant: row.type_composant,
    qualite: row.qualite,
    prix: row.prix == null ? 0 : Number(row.prix),
    garantie: row.garantie ?? 0,
    images: row.images ?? [],
    description: pick(row.description_fr, row.description_ar, lang) ?? undefined,
    etatActuel: row.etat_actuel,
    datePublication: toDateString(row.date_publication) ?? undefined,
    parentOrganeId: toNumber(row.organe_parent_id) ?? undefined,
  };

  if (row.type_composant === 'ORGANE') {
    return {
      ...base,
      typeComposant: 'ORGANE',
      typeEquipement: pick(row.type_equipement_fr, row.type_equipement_ar, lang) ?? '',
    };
  }

  return {
    ...base,
    typeComposant: 'PIECE',
    materiau: pick(row.materiau_fr, row.materiau_ar, lang) ?? undefined,
    compatibilite: pick(row.compatibilite_fr, row.compatibilite_ar, lang) ?? undefined,
  };
}
