# Plan — Introduce quantity to offers (World A: offer-stage quantity, fan-out into unique composants)

## 1. The goal

Today every flow assumes a **unique physical item**: `composant.reference` is unique,
`commande` has `unique(composant_id)` (one sale per item), each composant carries its own
traceability timeline, warranty and quality grade. A maintenance company can only offer one
object per offer.

We want a company to offer **multiple identical objects** in a single submission (e.g. "20
pistons"), and the admin to accept a **chosen quantity** of them (e.g. 14 of 20). Everything
downstream of acceptance stays exactly as it is: each accepted unit becomes its **own** unique
composant with its own reference, traceability, warranty and (eventual) sale.

This is **World A** — quantity is an *intake convenience*, not a catalog stock model. The
client-facing catalog, purchase flow, traceability and the sold-item freeze are untouched.

> Context for the jury: per-unit traceability is still done manually by the admin. The future
> `technicien` actor and AI assistance (out of scope here) will reduce that burden. We are
> deliberately **not** auto-copying timelines across siblings — those units are not truly
> identical (different diagnostics/repairs), so a shared timeline would be a falsehood.

## 2. Decisions (all agreed)

| # | Decision | Rationale |
|---|---|---|
| Model | **World A** — quantity lives on the offer; acceptance fans out into N unique composants | Preserves per-item traceability, unique reference, no-double-sale, warranty snapshot — the platform's whole integrity model |
| Price semantics | `offre.prix_propose` is **per unit** | Makes partial acceptance honest (14 × unit) and is migration-safe (qty 1 → per-unit == total) |
| Acceptance | **One-shot partial**: admin picks a quantity once; remainder implicitly declined; offer terminal | Matches a real intake decision; no half-open offers to bookkeep |
| Accepted record | Store the **number** (`quantite_acceptee`) on the offer; keep `statut = ACCEPTEE` | Records the truth ("14 of 20") without enum churn |
| Fan-out refs | `BASE-NN` where `BASE = offre.reference || OFFRE-{id}`, `NN` = zero-padded per-unit sequence | Unique within lot (seq) and across lots (offer id); human-readable lineage; admin renames pre-sale |
| Sibling grouping | **Free via shared `offre_id`** — no new lot/batch column | Already on `composant`; "all units from offer X" = `where offre_id = X` |
| Post-accept landing | **Worklist**: admin lands on the inventory list filtered to `offre_id = X` | Turns "N items to process" into a visible checklist |
| Copy helper | **Deferred** (manual per-unit traceability for now) | That automation belongs to the future technicien/AI actor; auto-copy would manufacture a traceability lie |
| Scope of quantity | **Both ORGANE and PIECE**; field optional, **default 1**, **cap 100** | No type-conditional logic; backward-compatible; cap bounds the fan-out (and `/offres` is public, so the cap is defensive) |
| Dashboard | **No new metrics** | Fanned-out units are real composant rows, so existing FR-34 counts/revenue absorb them |

## 3. What we will build

### 3.1 Database — two columns on `offre` (+ migration)
**Files:** `backend/schema.sql`, new `backend/migrations/002_offre_quantite.sql`

```sql
alter table public.offre
  add column quantite          int not null default 1 check (quantite >= 1 and quantite <= 100),
  add column quantite_acceptee int          check (quantite_acceptee is null
                                                    or (quantite_acceptee >= 1 and quantite_acceptee <= quantite));
```

Migration is idempotent (`add column if not exists`) and backfills existing accepted offers:

```sql
update public.offre set quantite_acceptee = 1 where statut = 'ACCEPTEE' and quantite_acceptee is null;
```

`prix_propose` is unchanged in shape; only its **meaning** becomes "per unit" (qty 1 rows are
identical either way, so no data migration).

### 3.2 Backend — submission accepts quantity
**Files:** `backend/schemas/offre.schema.js`, `backend/services/offre.service.js`

- `submitOffreSchema.body`: add `quantite: z.coerce.number().int().min(1).max(100).optional().default(1)`.
- `submit()`: include `quantite: body.quantite` in the inserted `offre` columns.

### 3.3 Backend — accept fans out N composants
**Files:** `backend/schemas/offre.schema.js`, `backend/controllers/offre.controller.js`,
`backend/services/offre.service.js`

- New `accepterOffreSchema = { params: idParam, query: langQuery, body: z.object({ quantite: z.coerce.number().int().min(1).optional() }) }`.
- Route `POST /offres/:id/accepter` uses it; controller passes `req.body.quantite` into the service.
- `accepter(offreId, quantite, lang)`:
  1. Load offer; guard `statut === 'EN_ATTENTE'` (else 409, unchanged).
  2. Resolve `n = quantite ?? offre.quantite`; validate `1 ≤ n ≤ offre.quantite` (else `VALIDATION_ERROR`).
  3. In one transaction, loop `i = 1..n`:
     - `base = offre.reference || 'OFFRE-' + offre.id`
     - `reference = base + '-' + String(i).padStart(2, '0')`
     - insert composant with the existing pre-fill (`type_composant`, `nom_*`, `marque`,
       `modele`, `categorie_id`, `qualite: 'BON'`, `prix: 0`, `garantie: 12`, `images`,
       `description_*`, `etat_actuel: 'EN_RECONDITIONNEMENT'`, `offre_id: offre.id`).
     - collect the created row.
  4. `update offre set statut = 'ACCEPTEE', quantite_acceptee = n where id = offreId`.
  5. Return the **array** of created composants (mapped).

> The unique-reference index is the safety net: a genuine cross-offer collision (company reused
> a reference string) throws at insert; acceptable because units are pre-sale and renameable.

### 3.4 Backend — offre mapper & list expose quantity
**Files:** `backend/services/mappers/offre.mapper.js`

- `toOffre`: add `quantite: toNumber(row.quantite) ?? 1` and
  `quantiteAcceptee: toNumber(row.quantite_acceptee) ?? undefined`.

### 3.5 Backend — composant list gains an `offreId` filter (worklist)
**Files:** `backend/schemas/composant.schema.js`, `backend/services/composant.service.js`

- `listComposantsSchema.query`: add `offreId: z.coerce.number().int().positive().optional()`.
- `list()`: `if (offreId) conds.push(sql\`offre_id = ${offreId}\`)`.

### 3.6 Frontend — types & schemas
**Files:** `frontend/src/lib/schemas.ts`, `frontend/src/types/index.ts`

- `offreSchema`: add `quantite: z.number().default(1)`, `quantiteAcceptee: z.number().optional()`.
- `Offre` interface: add `quantite: number`, `quantiteAcceptee?: number`.

### 3.7 Frontend — submission form
**Files:** `frontend/src/api/offres.ts`, `frontend/src/pages/ProposerPage.tsx`

- `SubmitOffreInput`: add `quantite?: number`.
- Form: add a **Quantité** number field (default 1, min 1, max 100) in the "Équipement"
  fieldset; validate `1 ≤ n ≤ 100`; pass `quantite` in the submit payload.

### 3.8 Frontend — accept with quantity + worklist landing
**Files:** `frontend/src/api/offres.ts`, `frontend/src/hooks/offres.ts`,
`frontend/src/pages/admin/OffresPage.tsx`, `frontend/src/pages/admin/InventairePage.tsx`

- `accepterOffre(id, quantite?)` → `POST /offres/:id/accepter` with `{ quantite }`; return
  `Composant[]` (parse with `composantListSchema`).
- `useAccepterOffre`: mutation input becomes `{ id, quantite }`.
- `OffresPage`:
  - Adapter maps the real `o.quantite` (drop the hardcoded `1`); show offered quantity,
    per-unit price, and a computed **lot total** (`quantite × prixPropose`) in `DetailPanel`.
  - Accept action: if `quantite > 1`, open a small dialog with a number input pre-filled to the
    full quantity (`1 ≤ n ≤ quantite`); on confirm, accept with `n`.
  - On success, navigate to the **worklist**: `/admin/inventaire?offreId=${offre.id}`
    (instead of the single-item editor).
- `InventairePage`: read `offreId` from the URL query and pass it as a list filter; show a small
  "Lot de l'offre #X (n unités)" banner with a clear-filter control.

## 4. Build order

1. `schema.sql` + `002_offre_quantite.sql` (apply migration).
2. Backend: offre schema (submit + accept), `accepter()` fan-out, mapper, composant `offreId` filter.
3. Frontend: types/schemas → API/hooks → ProposerPage quantity field → OffresPage accept dialog + lot total → InventairePage offreId filter.
4. Test (matrix below).

## 5. Test matrix

| Scenario | Expected |
|---|---|
| Submit offer with no quantity | `quantite = 1` (backward compatible) |
| Submit offer with quantity 20 | Stored `quantite = 20` |
| Submit quantity 0 / 101 / non-int | `VALIDATION_ERROR` |
| Accept full (omit body) on a qty-20 offer | 20 composants `OFFRE-X-01..20`, `quantite_acceptee = 20`, status ACCEPTEE |
| Accept 14 of 20 | 14 composants `…-01..14`, `quantite_acceptee = 14`, status ACCEPTEE |
| Accept 21 of 20 / 0 of 20 | `VALIDATION_ERROR`, no rows created |
| Accept an already-processed offer | 409 (unchanged) |
| Fan-out references | All unique; admin can rename pre-sale |
| Worklist landing | Lands on inventory filtered to `offre_id = X`, showing exactly the created units |
| Existing single offers / composants | Unchanged; dashboard counts/revenue unchanged |
| Each unit sold independently | Existing purchase + sold-freeze flow works per unit |
</content>
</invoke>
