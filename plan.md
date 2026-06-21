  # Plan — Lock traceability of sold composants (with audited override)

  ## 1. The problem

  Today, an admin can edit **any** composant (part or organ) and freely rewrite its
  traceability timeline — even after a client has bought it.

  When a client purchases an object, the buy flow (`acheter_composant()` in the DB) flips
  `composant.etat_actuel` to `VENDU` and creates a `commande` row. But **nothing stops an
  admin from editing that sold item afterward**:

  | Operation | Current behavior | Location |
  |---|---|---|
  | Update composant fields | Allowed, no state check | `backend/services/composant.service.js` → `update` |
  | Add a timeline step | Allowed, no state check | `backend/services/etape.service.js` → `create` |
  | Edit a timeline step | Allowed, no state check | `backend/services/etape.service.js` → `update` |
  | Delete a timeline step | Allowed, no state check | `backend/services/etape.service.js` → `remove` |
  | Reorder timeline steps | Allowed, no state check | `backend/services/etape.service.js` → `reorder` |

  The traceability is part of what the client paid for (provenance, warranty, what was
  reconditioned). If an admin can silently rewrite it after sale, the client's record can
  be falsified — an integrity and trust problem.

  ## 2. The policy we agreed on

  **Freeze by default, allow an audited correction.**

  - Once a composant is `VENDU`, **all** edits to it are blocked — both its own fields
    *and* its entire traceability timeline.
  - A deliberate **override** (explicit flag + a mandatory written reason) lets a genuine
    correction through.
  - Every override writes a **forensic audit record** (who / when / what operation / why /
    before & after values).

  ### Decisions and why

  | # | Decision | Why |
  |---|---|---|
  | Scope of freeze | **Everything** — composant fields + all 5 timeline operations | A blanket rule is simple to explain and defend to a client. "Frozen means frozen." The override handles the rare legitimate exception. |
  | Hierarchy | **Lock only the exact sold row** — no propagation to parent/child | An organ sold *whole* has no child pieces (pieces only exist when an organ is damaged and recycled). The two states are mutually exclusive, so there is nothing to propagate to. |
  | States covered | **`VENDU` only** (not `RECYCLE`) | The concern is client-facing records. No client relies on a recycled item's history. Easy to widen later if needed. |
  | Override mechanism | **Flag + mandatory reason**, any admin | Keeps a single admin role. The two-part action (flag + reason) makes the override deliberate, never accidental. The reason is what makes the audit meaningful. |
  | Audit storage | **Dedicated table, override-only, with before/after** | Scoped exactly to this edge case. Keeps the client-facing timeline clean. Before/after gives real forensic value in a dispute. |
  | Enforcement layer | **Service layer (Node)**, edit + audit in one transaction | All existing edit authorization lives in the service layer. The override context (flag + reason) is naturally available there. |
  | Race safety | **`SELECT ... FOR UPDATE`** inside the edit transaction | Closes the "admin edits while client buys" window. Symmetric with the existing `acheter_composant()` lock. |
  | API error | **409 with distinct code `COMPOSANT_VENDU`** | Lets the frontend distinguish "locked" from other 409s (e.g. double-sale) and offer the override path. |
  | Frontend UX | **Proactive lock** — banner + read-only, explicit "make a correction" action with a reason dialog | The admin sees the lock immediately and never wastes effort on an edit that gets rejected. |

  ## 3. What we will build

  ### 3.1 Database — new audit table
  **File:** `backend/schema.sql`

  ```sql
  create table journal_modification (
    id            bigint generated always as identity primary key,
    composant_id  bigint not null references composant(id),
    profil_id     bigint not null references profil(id),   -- the admin who made the change
    date          timestamptz not null default now(),
    operation     text   not null,   -- COMPOSANT_UPDATE | ETAPE_CREATE | ETAPE_UPDATE | ETAPE_DELETE | ETAPE_REORDER
    motif         text   not null,   -- the admin's written reason
    details       jsonb  not null    -- { "before": {...}, "after": {...} }
  );
  create index on journal_modification (composant_id);
  ```

  Append-only. Internal accountability only — never shown to clients.

  ### 3.2 Backend — the guard
  **Files:** `backend/services/composant.service.js`, `backend/services/etape.service.js`

  A shared helper, run **inside the edit's transaction**:

  ```
  guardSoldComposant(tx, composantId, { override, motif, profilId, operation }):
    1. row = SELECT etat_actuel FROM composant WHERE id = composantId FOR UPDATE
    2. if row.etat_actuel != 'VENDU'        -> return (normal edit, no audit)
    3. if VENDU and not override            -> throw 409 COMPOSANT_VENDU
    4. if VENDU and override:
        - require non-empty motif
        - capture `before`
        - (caller performs the edit)
        - capture `after`
        - INSERT one journal_modification row
      ... all in the same transaction as the edit
  ```

  Wire it into all five operations:
  - `composant.service.js` → `update`
  - `etape.service.js` → `create`, `update`, `remove`, `reorder`

  For etape operations, resolve the owning `composant_id` first (the etape FKs to it),
  then guard that composant.

  `acheter_composant()` itself is left untouched — you can't buy an already-sold item.

  ### 3.3 Backend — request contract & validation
  **Files:** `backend/schemas/composant.schema.js`, `backend/schemas/etape.schema.js`, controllers

  - Add optional `override: boolean` and `motif: string` to the relevant request bodies.
  - Validation rule: if `override === true`, `motif` must be a non-empty trimmed string
    (with a sane max length).
  - Controllers pass `{ override, motif }` plus the authenticated `profil_id` into the
    service.

  ### 3.4 Backend — error code
  **File:** the `AppError` / error-handling module

  Ensure the conflict carries the stable code `COMPOSANT_VENDU`, distinct from the existing
  double-sale 409, so the frontend can branch on it.

  ### 3.5 Frontend — API + hooks
  **Files:** `frontend/src/api/composants.ts`, `frontend/src/api/etapes.ts`, `frontend/src/hooks/*`

  - Thread optional `override` + `motif` through the five mutation calls.
  - In the hooks' error handling, detect `COMPOSANT_VENDU` and surface it as a structured
    "locked" signal instead of a generic failure.

  ### 3.6 Frontend — proactive lock UI
  **File:** `frontend/src/pages/admin/ItemEditorPage.tsx`

  - On load, if `etat_actuel === 'VENDU'`: show a **"Vendu — verrouillé"** banner and render
    all fields + the timeline read-only.
  - An **"Apporter une correction"** action unlocks editing.
  - On save in correction mode, open a confirmation dialog requiring a **motif**; submit
    with `override: true` + `motif`.
  - Safety net: if a `COMPOSANT_VENDU` 409 still comes back (item sold mid-edit), prompt for
    the reason and retry with override.

  ## 4. Build order

  1. `schema.sql` → add `journal_modification` table, migrate.
  2. Backend guard helper + wire into the 5 operations (`FOR UPDATE` + audit insert).
  3. Schema validation + error code + controller plumbing.
  4. Frontend API/hooks contract.
  5. `ItemEditorPage` lock banner + correction dialog.
  6. Test (see below).

  ## 5. Test matrix

  | Scenario | Expected |
  |---|---|
  | Edit an unsold (`EN_VENTE`) item | Passes, no audit row |
  | Edit a `VENDU` item without override | Rejected, 409 `COMPOSANT_VENDU` |
  | Edit a `VENDU` item with override + motif | Passes, one `journal_modification` row with before/after |
  | Override with empty/missing motif | Rejected by validation |
  | Client buys item while admin is mid-edit | Admin's save now requires override (no silent stale edit) |
  | Each of the 5 operations on a sold item | All guarded consistently |
  | `RECYCLE` item | Still editable (out of scope by design) |
