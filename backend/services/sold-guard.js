import AppError from '../utils/AppError.js';

// Freeze edits on SOLD composants, with a deliberate audited override.
//
// A composant becomes immutable once etat_actuel = 'VENDU' (the client now
// relies on its record). An admin may still apply a correction by passing
// override + motif; that path is allowed but recorded in journal_modification.
//
// These helpers run INSIDE the caller's transaction so the lock, the edit and
// the audit insert commit (or roll back) together. The FOR UPDATE row lock is
// symmetric with acheter_composant(): it serialises against an in-flight
// purchase, closing the "admin edits while client buys" window.

// Lock the composant row and enforce the freeze. Returns the locked row (the
// "before" snapshot) and whether the item is sold (→ caller must writeAudit).
export async function lockComposant(tx, composantId, { override, motif } = {}) {
  const [row] = await tx`
    select * from composant where id = ${composantId} for update
  `;
  if (!row) throw AppError.notFound('Composant introuvable.');

  const sold = row.etat_actuel === 'VENDU';
  if (sold && !override) {
    throw AppError.conflict(
      'Cet article est vendu : sa traçabilité est verrouillée.',
      'COMPOSANT_VENDU',
    );
  }
  if (sold && (!motif || !motif.trim())) {
    throw AppError.badRequest('Un motif est requis pour corriger un article vendu.');
  }

  return { row, sold };
}

// Append one audit row. Call only when lockComposant reported sold = true.
export async function writeAudit(tx, { composantId, profilId, operation, motif, before, after }) {
  await tx`
    insert into journal_modification (composant_id, profil_id, operation, motif, details)
    values (
      ${composantId}, ${profilId}, ${operation}, ${motif.trim()},
      ${tx.json({ before: before ?? null, after: after ?? null })}
    )
  `;
}
