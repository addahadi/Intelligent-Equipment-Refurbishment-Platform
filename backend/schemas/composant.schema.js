import { z } from 'zod';
import {
  idParam, langQuery, typeComposant, etatComposant, qualiteEtat, images,
} from './common.schema.js';

// Translatable fields: mono-lingual required/primary → _fr; optional *Ar → _ar.
// STI fields are accepted leniently; the service writes only the columns that
// match type_composant, so the DB check constraints never fire.
const writableFields = {
  nomAr: z.string().trim().optional(),
  marque: z.string().trim().optional(),
  modele: z.string().trim().optional(),
  reference: z.string().trim().min(1),
  categorieId: z.coerce.number().int().positive().nullish(),
  qualite: qualiteEtat.nullish(),
  prix: z.coerce.number().nonnegative(),
  garantie: z.coerce.number().int().nonnegative().optional().default(0),
  images,
  description: z.string().trim().optional(),
  descriptionAr: z.string().trim().optional(),
  etatActuel: etatComposant.optional(),
  datePublication: z.string().date().nullish(),
  offreId: z.coerce.number().int().positive().nullish(),
  parentOrganeId: z.coerce.number().int().positive().nullish(),
  // ORGANE-specific
  typeEquipement: z.string().trim().optional(),
  typeEquipementAr: z.string().trim().optional(),
  // PIECE-specific
  materiau: z.string().trim().optional(),
  materiauAr: z.string().trim().optional(),
  compatibilite: z.string().trim().optional(),
  compatibiliteAr: z.string().trim().optional(),
};

export const createComposantSchema = {
  body: z.object({
    typeComposant,
    nom: z.string().trim().min(1),
    ...writableFields,
  }),
};

// PATCH — every field optional; reference/nom/prix must stay non-empty if present.
export const updateComposantSchema = {
  params: idParam,
  body: z
    .object({
      typeComposant: typeComposant.optional(),
      nom: z.string().trim().min(1).optional(),
      ...writableFields,
      reference: z.string().trim().min(1).optional(),
      prix: z.coerce.number().nonnegative().optional(),
    })
    .partial(),
};

// Catalogue / inventory list filters (FR-06 / FR-07).
export const listComposantsSchema = {
  query: z.object({
    lang: z.enum(['fr', 'ar']).optional(),
    etat: etatComposant.optional(),
    search: z.string().trim().optional(),
    categorieId: z.coerce.number().int().positive().optional(),
    type: typeComposant.optional(),
    marque: z.string().trim().optional(),
    qualite: qualiteEtat.optional(),
    prixMin: z.coerce.number().nonnegative().optional(),
    prixMax: z.coerce.number().nonnegative().optional(),
    sort: z.enum(['recent', 'prix_asc', 'prix_desc']).optional().default('recent'),
  }),
};

export const composantIdSchema = { params: idParam, query: langQuery };

// FR-32 — declare salvageable child pieces under a parent organe.
export const declarePiecesSchema = {
  params: idParam,
  body: z.object({
    pieces: z
      .array(
        z.object({
          nom: z.string().trim().min(1),
          nomAr: z.string().trim().optional(),
          reference: z.string().trim().min(1),
          marque: z.string().trim().optional(),
          modele: z.string().trim().optional(),
          categorieId: z.coerce.number().int().positive().nullish(),
          qualite: qualiteEtat.nullish(),
          prix: z.coerce.number().nonnegative().optional().default(0),
          garantie: z.coerce.number().int().nonnegative().optional().default(0),
          images,
          description: z.string().trim().optional(),
          descriptionAr: z.string().trim().optional(),
          materiau: z.string().trim().optional(),
          materiauAr: z.string().trim().optional(),
          compatibilite: z.string().trim().optional(),
          compatibiliteAr: z.string().trim().optional(),
        }),
      )
      .min(1),
  }),
};
