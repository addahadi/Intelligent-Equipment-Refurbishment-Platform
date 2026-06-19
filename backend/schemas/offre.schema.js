import { z } from 'zod';
import { idParam, langQuery, typeComposant, etatDeclare, images } from './common.schema.js';

// Public submission (FR-17). Creates an entreprise + an offre in one tx.
// designation (required) → designation_fr; description → description_fr; *Ar optional.
export const submitOffreSchema = {
  body: z.object({
    designation: z.string().trim().min(1),
    designationAr: z.string().trim().optional(),
    typePropose: typeComposant,
    marque: z.string().trim().optional(),
    modele: z.string().trim().optional(),
    reference: z.string().trim().optional(),
    categorieId: z.coerce.number().int().positive().nullish(),
    etatDeclare,
    prixPropose: z.coerce.number().nonnegative(),
    description: z.string().trim().optional(),
    descriptionAr: z.string().trim().optional(),
    images,
    entreprise: z.object({
      nom: z.string().trim().min(1),
      contact: z.string().trim().min(1),
      adresse: z.string().trim().optional(),
    }),
  }),
};

export const listOffresSchema = {
  query: z.object({
    lang: z.enum(['fr', 'ar']).optional(),
    statut: z.enum(['EN_ATTENTE', 'ACCEPTEE', 'REJETEE']).optional(),
  }),
};

export const offreIdSchema = { params: idParam, query: langQuery };
