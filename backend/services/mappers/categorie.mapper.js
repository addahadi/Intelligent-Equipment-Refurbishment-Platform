import { pick } from '../../utils/lang.js';
import { toNumber } from './helpers.js';

export function toCategorie(row, lang = 'fr') {
  return {
    id: toNumber(row.id),
    libelle: pick(row.libelle_fr, row.libelle_ar, lang),
  };
}
