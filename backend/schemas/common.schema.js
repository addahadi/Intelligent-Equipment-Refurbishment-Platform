import { z } from 'zod';

// ─── Enums (mirror schema.sql / frontend types exactly) ─────────────────────
export const typeComposant = z.enum(['ORGANE', 'PIECE']);
export const etatComposant = z.enum(['EN_RECONDITIONNEMENT', 'EN_VENTE', 'VENDU', 'RECYCLE']);
export const qualiteEtat = z.enum(['COMME_NEUF', 'TRES_BON', 'BON', 'CORRECT']);
export const statutOffre = z.enum(['EN_ATTENTE', 'ACCEPTEE', 'REJETEE']);
export const etatDeclare = z.enum(['FONCTIONNEL', 'PARTIELLEMENT_FONCTIONNEL', 'DEFECTUEUX']);
export const statutCommande = z.enum(['SIMULEE', 'CONFIRMEE']);
export const typeEtape = z.enum([
  'DECOMPOSITION', 'NETTOYAGE', 'DIAGNOSTIC', 'REPARATION',
  'COMPOSITION', 'TEST', 'MISE_EN_VENTE', 'RECYCLAGE',
]);

// ─── Reusable primitives ────────────────────────────────────────────────────
// :id route params arrive as strings — coerce to positive integer.
export const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

export const langQuery = z.object({
  lang: z.enum(['fr', 'ar']).optional(),
});

export const url = z.string().url();
export const images = z.array(url).max(20).optional().default([]);
export const price = z.number().nonnegative();

// Audited-override fields for editing a SOLD composant. The service enforces
// that motif is non-empty when an override actually applies; here they are just
// accepted so validation doesn't strip them from the body.
export const overrideFields = {
  override: z.boolean().optional(),
  motif: z.string().trim().max(1000).optional(),
};
