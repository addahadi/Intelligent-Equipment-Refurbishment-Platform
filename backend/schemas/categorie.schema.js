import { z } from 'zod';
import { idParam } from './common.schema.js';

// Mono-lingual `libelle` (required) → libelle_fr; optional `libelleAr` → libelle_ar.
// When libelleAr is absent, the service duplicates libelle into both NOT NULL columns.
export const createCategorieSchema = {
  body: z.object({
    libelle: z.string().trim().min(1),
    libelleAr: z.string().trim().min(1).optional(),
  }),
};

export const categorieIdSchema = { params: idParam };
