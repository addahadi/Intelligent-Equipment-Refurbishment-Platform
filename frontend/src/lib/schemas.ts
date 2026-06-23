import { z } from 'zod'

// ─── Enums (mirror the API) ─────────────────────────────────────────────────
export const typeComposant = z.enum(['ORGANE', 'PIECE'])
export const etatComposant = z.enum(['EN_RECONDITIONNEMENT', 'EN_VENTE', 'VENDU', 'RECYCLE'])
export const qualiteEtat = z.enum(['COMME_NEUF', 'TRES_BON', 'BON', 'CORRECT'])
export const statutOffre = z.enum(['EN_ATTENTE', 'ACCEPTEE', 'REJETEE'])
export const etatDeclare = z.enum(['FONCTIONNEL', 'PARTIELLEMENT_FONCTIONNEL', 'DEFECTUEUX'])
export const statutCommande = z.enum(['SIMULEE', 'CONFIRMEE'])
export const typeEtape = z.enum([
  'DECOMPOSITION', 'NETTOYAGE', 'DIAGNOSTIC', 'REPARATION',
  'COMPOSITION', 'TEST', 'MISE_EN_VENTE', 'RECYCLAGE',
])

// ─── Resources ──────────────────────────────────────────────────────────────
export const categorieSchema = z.object({
  id: z.number(),
  libelle: z.string().nullable().transform((v) => v ?? ''),
})

// STI is collapsed on the server; accept both organe & piece fields optionally.
export const composantSchema = z.object({
  id: z.number(),
  nom: z.string().nullable().transform((v) => v ?? ''),
  reference: z.string(),
  marque: z.string().default(''),
  modele: z.string().default(''),
  categorieId: z.number().nullable().optional(),
  typeComposant,
  qualite: qualiteEtat.nullable().optional(),
  prix: z.number(),
  garantie: z.number(),
  images: z.array(z.string()).default([]),
  description: z.string().optional(),
  etatActuel: etatComposant,
  datePublication: z.string().optional(),
  parentOrganeId: z.number().optional(),
  typeEquipement: z.string().optional(),
  materiau: z.string().optional(),
  compatibilite: z.string().optional(),
})

export const etapeSchema = z.object({
  id: z.number(),
  composantId: z.number(),
  type: typeEtape,
  ordre: z.number(),
  date: z.string().nullable().transform((v) => v ?? ''),
  description: z.string().nullable().transform((v) => v ?? ''),
})

export const offreSchema = z.object({
  id: z.number(),
  designation: z.string().nullable().transform((v) => v ?? ''),
  typePropose: typeComposant,
  marque: z.string().default(''),
  modele: z.string().default(''),
  reference: z.string().default(''),
  categorieId: z.number().nullable().optional(),
  etatDeclare,
  prixPropose: z.number(),
  description: z.string().optional(),
  images: z.array(z.string()).default([]),
  dateOffre: z.string().nullable().transform((v) => v ?? ''),
  statut: statutOffre,
  quantite: z.number().default(1),
  quantiteAcceptee: z.number().optional(),
  entrepriseId: z.number().nullable().optional(),
  composantId: z.number().optional(),
  entreprise: z
    .object({
      id: z.number().nullable().optional(),
      nom: z.string(),
      contact: z.string().nullable().transform((v) => v ?? ''),
      adresse: z.string().optional(),
    })
    .optional(),
})

export const commandeSchema = z.object({
  id: z.number(),
  clientId: z.number(),
  composantId: z.number(),
  date: z.string().nullable().transform((v) => v ?? ''),
  prix: z.number(),
  statut: statutCommande,
  dateFinGarantie: z.string().nullable().transform((v) => v ?? ''),
  client: z.object({ nom: z.string(), email: z.string() }).optional(),
  composant: z
    .object({ nom: z.string(), reference: z.string(), garantie: z.number() })
    .optional(),
})

export const userSchema = z.object({
  id: z.number(),
  nom: z.string(),
  email: z.string(),
  role: z.enum(['CLIENT', 'ADMINISTRATEUR']),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  favoris: z.array(z.number()).optional(),
  commandes: z.array(z.number()).optional(),
})

export const authResponseSchema = z.object({
  token: z.string(),
  user: userSchema,
})

export const statsSchema = z.object({
  offres: z.object({ EN_ATTENTE: z.number(), ACCEPTEE: z.number(), REJETEE: z.number() }),
  inventaire: z.object({
    EN_RECONDITIONNEMENT: z.number(),
    EN_VENTE: z.number(),
    VENDU: z.number(),
    RECYCLE: z.number(),
  }),
  revenuSimule: z.number(),
  enVente: z.number(),
})

export const composantListSchema = z.array(composantSchema)
export const categorieListSchema = z.array(categorieSchema)
export const etapeListSchema = z.array(etapeSchema)
export const offreListSchema = z.array(offreSchema)
export const commandeListSchema = z.array(commandeSchema)
