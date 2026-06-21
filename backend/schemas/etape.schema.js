import { z } from 'zod';
import { idParam, langQuery, typeEtape, overrideFields } from './common.schema.js';

// Add an étape to a composant (admin). FR-33 side-effects (MISE_EN_VENTE /
// RECYCLAGE flip etat_actuel) are handled in the service.
export const createEtapeSchema = {
  params: idParam, // :id = composant id
  body: z.object({
    type: typeEtape,
    ordre: z.coerce.number().int().nonnegative().optional(),
    date: z.string().date().optional(),
    description: z.string().trim().optional(),
    descriptionAr: z.string().trim().optional(),
    ...overrideFields,
  }),
};

export const updateEtapeSchema = {
  params: idParam, // :id = etape id
  body: z
    .object({
      type: typeEtape.optional(),
      ordre: z.coerce.number().int().nonnegative().optional(),
      date: z.string().date().optional(),
      description: z.string().trim().optional(),
      descriptionAr: z.string().trim().optional(),
      ...overrideFields,
    })
    .partial(),
};

export const reorderEtapeSchema = {
  params: idParam, // :id = etape id
  body: z.object({ direction: z.enum(['up', 'down']), ...overrideFields }),
};

export const listEtapesSchema = { params: idParam, query: langQuery };
