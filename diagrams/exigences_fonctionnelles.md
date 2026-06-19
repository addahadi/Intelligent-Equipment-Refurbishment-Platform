# Functional Requirements — Intelligent Equipment Refurbishment Platform
### *Plateforme de Reconditionnement Intelligent d'Équipements*

## 1. Purpose & Scope

The platform digitizes the activity of a refurbishment startup. It serves **two business goals**:

1. **Sourcing** — a company's maintenance service proposes an *organe* or a *pièce* (with a price) to the startup through a simple offer form, reviewed by an administrator.
2. **Resale + Trust** — once the startup has reconditioned an item, a client can browse the catalog, inspect the full repair **traceability**, and buy the item (simulated purchase).

The buying process and any payment are **simulated** (no real transaction). The scope is a university graduate project, so each module is intentionally kept simple but complete.

## 2. Actors

| Actor | Authentication | Role summary |
|---|---|---|
| 👤 **Client** | Register + login | Browses, searches, filters, saves favorites, inspects traceability, buys (simulated) |
| 🏭 **Entreprise (maintenance service)** | None — anonymous public form | Submits a single offer per form (organe or pièce + proposed price) |
| 🛠️ **Administrateur** | Login | Reviews offers, manages items, records traceability, lists items for sale, views statistics |

## 3. Functional Requirements

> Priority legend: 🔴 *Must* · 🟠 *Should* · 🟢 *Nice-to-have*

### 3.1 Authentication & Accounts

| ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-01 | The system shall let a client create an account (name, email, password). | Client | 🔴 |
| FR-02 | The system shall authenticate clients and administrators by email + password. | Client, Admin | 🔴 |
| FR-03 | The system shall let an authenticated user log out and end the session. | Client, Admin | 🔴 |
| FR-04 | The system shall require authentication before a client can buy or save a favorite. | Client | 🔴 |

> 💡 **Admin provisioning:** There is **no admin-registration UI**. A single administrator account is **seeded at deployment** by a migration/seed script (password stored hashed per NFR-02); credentials are handed over offline. Multi-admin / "admin-creates-admin" is explicit future work.

### 3.2 Catalog, Search & Item Details (Client)

| ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-05 | The system shall display the catalog of items whose state is `EN_VENTE` only. | Client | 🔴 |
| FR-06 | The system shall let the client search items by keyword (name/description). | Client | 🔴 |
| FR-07 | The system shall let the client filter items by structured criteria: category, type (organe/pièce), brand (`marque`), quality grade (`grade`), and price range. | Client | 🔴 |
| FR-08 | The system shall display the full details of a selected item: name, reference, brand, model, category, type (organe/pièce), quality grade, warranty, price, and **image gallery**. | Client | 🔴 |
| FR-09 | When viewing item details, the system shall display the item's **traceability timeline** (the ordered list of completed steps). | Client | 🔴 |
| FR-10 | The system shall let the client add/remove an item to/from a personal **favorites** list. When a favorited item has been sold (`VENDU`), it shall remain in the list rendered as a **dimmed "Vendu" card with the buy action disabled** (its traceability stays viewable); favorites are never silently removed. | Client | 🟠 |

### 3.3 Smart Feature — Recommendations (Client)

| ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-11 | While viewing an item's details, the system *may* display **recommended similar items** (rule-based: same category and/or comparable price range, state `EN_VENTE`, excluding the current item). | Client | 🟠 |

> 💡 **Design note:** Recommendations are an `«extend»` of *Consulter les détails d'un objet* — they enhance the detail page but are not mandatory to it. The engine is rule-based now and is documented as *extensible to a machine-learning approach* in future work. This is the project's answer to *"where is the intelligence?"*.

### 3.4 Purchase (Client)

| ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-12 | The system shall let an authenticated client buy an available item through a **simulated** purchase (no real payment). | Client | 🔴 |
| FR-13 | On purchase, the system shall create a `Commande` recording the client, the item, the date, the price, and the status. | Client | 🔴 |
| FR-14 | On purchase, the system shall set the item state to `VENDU` and remove it from the public catalog. The purchase shall **re-check `etatActuel == EN_VENTE` inside the same transaction** that creates the `Commande` and flips the state; if the item is no longer available, the purchase fails cleanly ("Cet article vient d'être vendu") and no `Commande` is created (prevents a double-sale of a unique item). | System | 🔴 |
| FR-15 | The system shall let a client view the history of their own orders. | Client | 🟠 |
| FR-16 | On purchase, the system shall compute and store the warranty period on the `Commande` (`dateFinGarantie` = purchase date + the item's `garantie` in months) and display the warranty status in **Mes commandes** — e.g. "Sous garantie jusqu'au 24/09/2025 — 4 mois restants", or "Garantie expirée". | System, Client | 🟠 |

### 3.5 Offer Submission (Entreprise)

| ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-17 | The system shall provide a **public form** allowing a maintenance service to submit an offer with **structured fields**: company identity (`nom`, `contact`, `adresse`); item `designation`, `typePropose` (organe/pièce), `marque`, `modele`, `reference`, `categorie`, `etatDeclare` (`FONCTIONNEL`/`PARTIELLEMENT_FONCTIONNEL`/`DEFECTUEUX`), `prixPropose`, optional `description` notes, and one or more **`images`**. | Entreprise | 🔴 |
| FR-18 | On submission, the system shall store the company identity as an `Entreprise` record and create an `Offre` with status `EN_ATTENTE`. | System | 🔴 |
| FR-19 | The system shall accept submissions without authentication (no company account). | Entreprise | 🔴 |

> ⚠️ **Accepted limitation:** Company records are captured per submission and are **not deduplicated** — two offers from the same company may create two `Entreprise` rows. This is acceptable for the project scope.

### 3.6 Offer Management (Admin)

| ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-20 | The system shall let the admin view the list of received offers and their status. | Admin | 🔴 |
| FR-21 | The system shall let the admin **accept** an offer (status → `ACCEPTEE`) or **reject** it (status → `REJETEE`). | Admin | 🔴 |
| FR-22 | When an offer is accepted, the system shall generate a `Composant` (organe or pièce) entering the reconditioning pipeline with state `EN_RECONDITIONNEMENT`, **pre-filling its structured fields** (`reference`, `marque`, `modele`, `categorie`, and `images`) from the accepted offer. | System | 🔴 |
| FR-23 | A rejected offer shall not generate any catalog item. | System | 🔴 |

> 💡 **Data-design note:** Offers and items use **typed, structured fields** (reference, brand, model, category, condition, grade…) rather than a single free-text blob. The `description` field is kept only for optional free-text remarks. This makes search/filter meaningful, lets the admin pre-fill an item from an accepted offer, and gives the database a real schema to defend.

### 3.7 Item & Traceability Management (Admin)

| ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-24 | The system shall let the admin create and edit a `Composant` with **structured attributes**: `nom`, `reference`, `marque`, `modele`, `categorie`, `qualite` (`COMME_NEUF`/`TRES_BON`/`BON`/`CORRECT`), `prix`, `garantie` (months), optional `description` notes, and an **`images`** gallery. Organe-specific: `typeEquipement`; pièce-specific: `materiau`, `compatibilite`. | Admin | 🔴 |
| FR-25 | The system shall let the admin manage the list of **categories** (`Categorie`) used to classify offers and items. | Admin | 🟠 |
| FR-26 | The system shall let the admin add **traceability steps** to an item, each with a type, order, date, and description. The `DIAGNOSTIC` step, recorded after `NETTOYAGE`, additionally captures a **verdict** ("Réparable" / "Endommagé") in its description; this verdict is the decisive fork (see BR-02/BR-08) and determines which subsequent steps are legal. | Admin | 🔴 |
| FR-27 | The system shall offer the step types: `DECOMPOSITION`, `NETTOYAGE`, `DIAGNOSTIC`, `REPARATION`, `COMPOSITION`, `TEST`, `MISE_EN_VENTE`, `RECYCLAGE`. | System | 🔴 |
| FR-28 | The system shall let the admin set an item's final outcome as **mise en vente** (`EN_VENTE`) or **recyclage** (`RECYCLE`). | Admin | 🔴 |
| FR-29 | The system shall make only items in state `EN_VENTE` visible to clients. | System | 🔴 |
| FR-30 | The system shall let the admin **edit or delete an existing traceability step** (its type, date, and note) and **reorder** steps, in addition to adding them. | Admin | 🟠 |
| FR-31 | The traceability builder shall apply **validation guards** as soft warnings: `DECOMPOSITION`/`COMPOSITION` are not allowed on a pièce; `COMPOSITION` should be preceded by a `DECOMPOSITION`; `DIAGNOSTIC` should be preceded by a `NETTOYAGE`; `REPARATION`/`COMPOSITION` should only follow a `DIAGNOSTIC` whose verdict is "Réparable"; `RECYCLAGE` is the expected outcome when the verdict is "Endommagé"; a terminal step (`MISE_EN_VENTE` or `RECYCLAGE`) should be the last step. | System | 🟠 |
| FR-32 | `DECOMPOSITION` and `COMPOSITION` are **inspection/logged steps only** and create no child records on their own. Salvaged pièces are declared at the **recycle decision**: when the admin sets an organe's outcome to `RECYCLAGE`, the system shall present a **"declare salvageable pièces"** sub-form. Each declared pièce becomes its own `Composant` (type Pièce) linked to the organe, with its own traceability and its own independent state (it may be put on sale or recycled regardless of the parent organe's outcome). The declare-pièce form **pre-fills `marque`, `modele`, `categorie`, and the parent `images` gallery as editable defaults** (shared origin), **requires the physical specifics fresh** (`nom`, unique `reference`, `prix`, `qualite`, `garantie`, plus pièce-specific `materiau`/`compatibilite`), and **auto-sets** `typePropose = PIECE`, `etatActuel = EN_RECONDITIONNEMENT`, the link to the parent organe, and the first traceability node carrying the provenance text. An **undamaged** organe is recomposed and sold whole — it spawns **no** child pièce records. | Admin | 🔴 |
| FR-33 | The item's `etatActuel` shall be a **single, derived status** (`EN_RECONDITIONNEMENT`/`EN_VENTE`/`VENDU`/`RECYCLE`): adding a terminal traceability step sets it (`MISE_EN_VENTE` → `EN_VENTE`, `RECYCLAGE` → `RECYCLE`). The admin UI shall display a short **description of the current state** so the consequence (visible / hidden in the catalog) is explicit. | System | 🟠 |

### 3.8 Statistics (Admin)

| ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-34 | The system shall display a dashboard with: number of offers by status, number of items by state (en reconditionnement / en vente / vendu / recyclé), and total simulated revenue. **Revenue shall be computed as `SUM(Commande.prix)`** (the price actually paid, snapshotted on the order) — never the current `Composant.prix`, which the admin may edit after a sale. | Admin | 🟠 |

## 4. Business Rules

| ID | Rule |
|---|---|
| BR-01 | Only an **organe** can undergo `DECOMPOSITION` and `COMPOSITION`. A **pièce** never has these steps. Both are **inspection/logged steps**: they record that the organe was taken apart for diagnosis and (if undamaged) reassembled — they create **no** child records by themselves. |
| BR-02 | The traceability path is **variable**, decided by a `DIAGNOSTIC` step performed **after `NETTOYAGE`**. For an **organe**: if the diagnostic verdict is **Endommagé** → `décomposition → nettoyage → diagnostic → RECYCLAGE` (the organe is scrapped and never recomposed; at the recycle decision its salvageable pièces are declared and listed for sale individually); if **Réparable** → `décomposition → nettoyage → diagnostic → réparation → composition → test → mise en vente`. `DECOMPOSITION` and `COMPOSITION` therefore occur **together or not at all** — composition happens only for a réparable organe, which is sold whole. For a **pièce** (offered directly): `nettoyage → diagnostic → (réparation if needed) → test → mise en vente`, or `recyclage` if scrap. A **salvaged pièce** (from a recycled organe): `nettoyage → diagnostic → (réparation if needed) → test → mise en vente`. |
| BR-03 | Decomposing an organe is inspection only; salvageable pièces are produced **at the recycle decision** (when the organe's outcome is set to `RECYCLAGE`). Those pièces can be sold individually **even though the parent organe is recycled** — sale status is decided per item by the admin. |
| BR-04 | Each `Composant` is **unique** (quantity = 1). Once bought, it becomes `VENDU` and leaves the catalog. |
| BR-05 | A pièce may originate from a decomposed organe **or** be offered directly by a company (the link to an organe is optional). |
| BR-06 | A purchase concerns exactly **one** item (no multi-item cart in this version). |
| BR-07 | Sale price (startup → client) and proposed price (company → startup) are distinct values. |
| BR-08 | The `DIAGNOSTIC` step after `NETTOYAGE` is the decisive fork, and its verdict is **recorded** (not merely implied by the next step). For an organe: verdict **Endommagé** → `RECYCLAGE` (no réparation, no composition; declare salvageable pièces); verdict **Réparable** → `réparation → composition → test → mise en vente`. The offer's declared condition (`etatDeclare`) is an initial hint, but the recorded post-cleaning verdict is what determines the actual path. See BR-02. |
| BR-09 | A salvaged pièce is a **full `Composant`** (subtype Pièce) with its **own `EtapeTracabilite` history** and its own `etatActuel` — independent of the parent organe. Its timeline shows provenance as the first node, `(issue de la décomposition de <organe>)`, displayed as **plain text, not a hyperlink** (a recycled parent has no client-facing page). Navigation: the **admin** can open any pièce's editor regardless of its state; a **client** sees a pièce (its detail page + traceability) only when its `etatActuel = EN_VENTE`. The same item-detail and `TraceabilityTimeline` components render organes and pièces interchangeably. |
| BR-10 | The warranty (`garantie`, in months) is an attribute of the item, but it only becomes **active on purchase**: `Commande.dateFinGarantie = Commande.date + garantie months`. An item is "sous garantie" while the current date is before `dateFinGarantie`; otherwise the warranty is expired. The remaining duration is computed for display, not stored. |

## 5. Non-Functional Requirements (brief)

| ID | Requirement |
|---|---|
| NFR-01 | **Usability** — the client catalog and the offer form shall be simple and self-explanatory. |
| NFR-02 | **Security** — passwords shall be stored hashed; admin features shall be restricted to authenticated administrators. |
| NFR-03 | **Reliability** — the traceability of a sold item shall remain viewable as proof of the refurbishment process. |
| NFR-04 | **Maintainability** — the recommendation logic shall be isolated (a dedicated service) so it can later be replaced by an ML model without touching the catalog. |

---

*Scope note: this specification reflects the decisions agreed during analysis — abstract `Composant`/`Utilisateur` hierarchies, a separate `Offre` entity, anonymous company submissions, a flexible `EtapeTracabilite` timeline, unique items with simulated `Commande` purchases, and a rule-based recommendation feature.*
