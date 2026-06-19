import { pick } from '../../utils/lang.js';
import { toNumber, toDateString } from './helpers.js';

export function toEtape(row, lang = 'fr') {
  return {
    id: toNumber(row.id),
    composantId: toNumber(row.composant_id),
    type: row.type,
    ordre: row.ordre,
    date: toDateString(row.date),
    description: pick(row.description_fr, row.description_ar, lang) ?? '',
  };
}
