# UI/UX Specification — Plateforme de Reconditionnement Intelligent
### Design system & screen brief · "Le Passeport"

**Stack:** React + TypeScript · shadcn/ui (Radix headless) · Tailwind CSS
**Companion documents:** `exigences_fonctionnelles.md` (FR/BR IDs referenced throughout), `diagramme_classes`, `sequence_offre_reconditionnement`, `sequence_achat_client`.
**UI language:** French (all user-facing copy). This document is written in English; quoted copy is the real interface text.

---

## 0. Design thesis

This is a startup selling **reconditioned industrial production equipment** (organes and pièces) to maintenance and procurement buyers who will only trust used industrial gear if they can *see it won't fail again*. The traceability is not a feature — it is the product. The interface is therefore designed as a **technical dossier / equipment passport**, not a shop.

Three through-lines hold the whole system together. Every decision below serves at least one:

1. **Provenance is the spine.** Every client screen points toward the traceability dossier. The dossier is the center of gravity, never a buried tab.
2. **Colour always means state.** The accent palette encodes `EtatComposant` and offer status. Colour is never decoration; if something is verdigris, it is *certified/live*.
3. **One authored voice.** Errors give direction, empty states invite action, an action keeps its verb from button to confirmation, and even loading looks like the product.

---

## 1. Surface & device strategy

Three actors use this product on different devices for different jobs. Effort is concentrated accordingly.

| Surface | Actor | Device target | Build stance |
|---|---|---|---|
| **Client app** | Client | **Mobile-first**, scales up to desktop | The conversion & trust surface — highest polish |
| **Admin console** | Administrateur | **Desktop-only** (≥1280px), dense | Operator tool; below breakpoint, show a polite "use a larger screen" gate |
| **Offer form** | Entreprise | **Responsive-simple** | One standalone page, works at any width, no complex layout |

**Admin breakpoint gate:** below ~1024px the admin routes render a single centered message — *"La console d'administration est conçue pour un écran large. Ouvrez-la sur un ordinateur."* No mobile admin layouts are built.

---

## 2. Design language (tokens)

### 2.1 Colour

The signature choice is **verdigris** — the green of oxidized metal, the literal colour of used industrial equipment before it is restored. The brand colour therefore *means* "reconditioning." It is muted and metallic by intent, not a bright accent.

| Token | Hex | Role |
|---|---|---|
| `atelier` | `#EEF1F2` | App background (cool zinc "spec-sheet paper") |
| `panel` | `#FAFBFB` | Cards, surfaces, sheets |
| `graphite` | `#18211F` | Primary text / ink |
| `steel` | `#6E7A80` | Secondary text; `vendu` / closed states |
| `rule` | `#DCE1E2` | Hairline borders, dividers |
| `verdigris` | `#1C7A62` | Accent — certified / live / `en vente` |
| `verdigris-700` | `#155C4B` | Hover / pressed |
| `verdigris-50` | `#E7F2EE` | Badge & highlight tints |
| `brass` | `#A87C2A` | `en reconditionnement` / in-progress / soft warnings |
| `brass-50` | `#F4EDDD` | Warning tint |
| `oxide` | `#9C4A2C` | `recyclé` / terminal-scrap |
| `oxide-50` | `#F2E4DD` | Recycled tint |

**CSS variables (drop into `globals.css`, map into `tailwind.config`):**

```css
:root {
  --atelier:#EEF1F2; --panel:#FAFBFB; --graphite:#18211F;
  --steel:#6E7A80; --rule:#DCE1E2;
  --verdigris:#1C7A62; --verdigris-700:#155C4B; --verdigris-50:#E7F2EE;
  --brass:#A87C2A; --brass-50:#F4EDDD;
  --oxide:#9C4A2C; --oxide-50:#F2E4DD;
}
```

### 2.2 State colour semantics (single source of truth)

These mappings are used **identically** on every surface — client badges, admin tiles, dashboard funnel — so the colour teaches itself once.

| Domain value | Colour | Meaning |
|---|---|---|
| `EtatComposant.EN_RECONDITIONNEMENT` | `brass` | In progress, not yet public |
| `EtatComposant.EN_VENTE` | `verdigris` | Certified & live in catalog |
| `EtatComposant.VENDU` | `steel` | Settled / closed |
| `EtatComposant.RECYCLE` | `oxide` | Scrapped (organe), parts may live on |
| `StatutOffre.EN_ATTENTE` | `brass` | Awaiting review (actionable) |
| `StatutOffre.ACCEPTEE` | `verdigris` | Accepted → became an item |
| `StatutOffre.REJETEE` | `steel` | Closed, no item |
| Warranty active | `verdigris` | Within `dateFinGarantie` |
| Warranty expired | `steel` | Past `dateFinGarantie` |

### 2.3 Typography

Three roles, all from the engineering-documentation lineage. Display is used **big and sparingly**; the mono face is reserved for *recorded technical data* (references, dates, prices, traceability stamps), which makes data look stamped rather than typed.

| Role | Family | Usage | Weights |
|---|---|---|---|
| Display | **Archivo** | Item names, section heads, hero numerals | 600 / 700 |
| Body | **IBM Plex Sans** | Paragraphs, labels, controls | 400 / 500 / 600 |
| Data | **IBM Plex Mono** | `reference`, serial, dates, `prix`, step stamps | 400 / 500 |

**Type scale (rem @ 16px base):**

| Step | Face / weight | Size / line |
|---|---|---|
| Display-XL (item name) | Archivo 600 | 2.0–2.5rem / 1.1 |
| H1 | Archivo 600 | 1.5rem / 1.2 |
| H2 | Archivo 600 | 1.25rem / 1.25 |
| Body | Plex Sans 400 | 1.0rem / 1.55 |
| Small | Plex Sans 400 | 0.875rem / 1.5 |
| Eyebrow/label | Plex Sans 500 | 0.75rem / 1.4, uppercase, +0.04em tracking |
| Data | Plex Mono 500 | 0.875–1.0rem |

Fonts load from Google Fonts (`Archivo`, `IBM Plex Sans`, `IBM Plex Mono`).

### 2.4 Form, space, motion

- **Radius:** 4px default · 2px chips/badges · 8px dialogs/sheets. Crisp, document-like — never pill-rounded.
- **Borders over shadows.** Prefer 1px `rule` borders for separation (technical-document feel). Shadows are reserved for floating layers only: dialogs, sheets, the mobile sticky buy bar, dropdowns. One soft shadow token, used consistently.
- **Spacing:** 4-based scale — 4 · 8 · 12 · 16 · 24 · 32 · 48.
- **Motion:** 150–200ms ease for hovers and state changes. Content-shaped **skeletons** on the catalog and dossier. **Optimistic** favorite toggle (fill instantly, reconcile after). No decorative/ambient motion. `prefers-reduced-motion` removes transitions and reveals.
- **Imagery:** product photos framed **plainly** (thin `rule` border, `panel` mat, no glossy retail crop) so they read as documentation, not advertising.

---

## 3. Navigation architecture

### 3.1 Route map

| Route | Surface | Auth |
|---|---|---|
| `/` | Catalogue (home) | Public |
| `/equipement/:id` | Item detail (dossier) | Public — incl. full traceability |
| `/favoris` | Favoris | Client |
| `/commandes` | Mes commandes | Client |
| `/compte` | Compte | Client |
| `/connexion`, `/inscription` | Auth (also as sheet) | Public |
| `/proposer` | Offer form (standalone) | Public, anonymous |
| `/admin` | Dashboard | Admin |
| `/admin/offres` | Offer review | Admin |
| `/admin/inventaire` | Inventory list | Admin |
| `/admin/inventaire/:id` | Item editor + traceability builder | Admin |
| `/admin/categories` | Category management | Admin |
| `/admin/ventes` | Sales list | Admin |

### 3.2 Patterns

- **Client = catalog-as-home.** No marketing splash before the product; a slim promise band sits atop the catalog, then it's items. *Trust is proven by showing real dossiers, not described in a hero.*
- **Mobile:** bottom tab bar — `Catalogue · Favoris · Commandes · Compte`. Thumb-reachable, persistent, no hamburger.
- **Desktop:** the same destinations promote to a top bar with inline search.
- **Admin:** persistent collapsible **left sidebar** — `Tableau de bord · Offres · Inventaire · Catégories · Ventes`. `Offres` carries a **count badge of `EN_ATTENTE` offers** (the operator's real to-do signal).
- **Offer form:** standalone public route, app chrome stripped to a logo + one orienting line. Reached via a quiet client-footer link: *"Vous êtes une entreprise ? Proposez un équipement."*
- **Auth is gate-level, never a wall.** Browse, search, and the **full dossier are public**. The login prompt appears only when a client taps Acheter / ♡ / Commandes, and returns them to their exact place (FR-04).

---

## 4. Component inventory (shared)

Build these once; reuse across surfaces. The **TraceabilityTimeline** and **EquipmentCard** are the two load-bearing shared components.

| Component | Reused by | Notes / FR refs |
|---|---|---|
| `StateBadge` | everywhere | Colour from §2.2 state map; renders `EtatComposant` and offer status |
| `QualityGauge` | card, detail | 4-segment gauge for `qualite` (COMME_NEUF=4 → CORRECT=1) filled in verdigris. **Never stars** — grade is an inspection result, not an opinion |
| `ReferencePlate` | card, detail, editor | `reference` in Plex Mono, styled like an engraved serial plate |
| `PriceTag` | card, detail, dialog | `prix` in Plex Mono |
| `WarrantyStatus` | detail, commandes | Live-computed from `dateFinGarantie` (BR-10); verdigris active / steel expired |
| `EquipmentCard` | catalog, favoris | "Equipment-tag" style; **dimmed `Vendu` variant** (FR-10, Q5) |
| `TraceabilityTimeline` | detail (read), builder (edit) | **One component, two modes** (BR-09). Sub-nodes: `StepNode`, `DiagnosticVerdictNode`, `ProvenanceNode`, `TerminalNode` |
| `SearchField` | catalog | Keyword over name/description (FR-06) |
| `FilterRail` / `FilterSheet` | catalog | Desktop rail / mobile sheet (FR-07) |
| `FilterChips` | catalog | Applied filters, each removable; + result count |
| `ImageGallery` | detail, offer review, editor | Plain technical framing |
| `StepPanel` | builder | Fork-aware next-step suggester (Q6) |
| `DeclarePiecesDialog` | builder | Recycle-spawn, inherited/required field split (FR-32) |
| `ConfirmPurchaseDialog` | detail | Honest "simulé" confirmation (Q8) |
| `AuthSheet` | gate | Why-prompt + connexion/inscription, return-to-place |
| `DataTable` | offers, inventory, ventes | Dense desktop table (shadcn) |
| `MetricTile`, `TodoBand`, `ConversionFunnel` | dashboard | §9 |
| `EmptyState`, `Skeleton*`, `Toast` | everywhere | Voice rules §10 |

---

## 5. Client — Catalogue (home)

**Purpose:** promise the dossier at a glance so people open it. Shows only `EN_VENTE` items (FR-05/FR-29).

**Card = an equipment tag, not a product tile:** plain-framed image · `nom` (Archivo) · `ReferencePlate` (mono) · `marque` + a small Organe/Pièce type label · `QualityGauge` · `PriceTag` · one trust cue **"Dossier tracé · N étapes"** (the line that earns the tap). **No "En vente" badge** — the whole catalog is en vente, so a constant badge is noise.

**Search & filter:** persistent search at top. Filters (category, type, brand, grade, price range — FR-07) open as a **bottom sheet** on mobile, a **sticky left rail** on desktop. Applied filters show as removable **chips** + result count. **Sort:** three options only — Prix croissant / Prix décroissant / Plus récent (`datePublication`).

**States:** content-shaped card skeletons while loading. Empty: *"Aucun équipement ne correspond à ces filtres."* + "Réinitialiser les filtres."

```
MOBILE                              DESKTOP
┌─────────────────────────┐        ┌───────────────────────────────────────┐
│ ⌕ Rechercher…           │        │ Logo   ⌕ Rechercher…     Favoris Compte │
│ « Chaque équipement,    │        ├──────────┬────────────────────────────┤
│   son dossier complet » │        │ FILTRES  │ 14 équipements   [Trier ▾] │
│ [Filtrer ▾]  14 results │        │ Catégorie│ chips: Pompe ✕  < 500€ ✕   │
├─────────────────────────┤        │ Type     │ ┌──────┐ ┌──────┐ ┌──────┐ │
│ ┌─────────┐ ┌─────────┐ │        │ Marque   │ │ tag  │ │ tag  │ │ tag  │ │
│ │  tag    │ │  tag    │ │        │ Grade    │ │ card │ │ card │ │ card │ │
│ │  card   │ │  card   │ │        │ Prix     │ └──────┘ └──────┘ └──────┘ │
│ └─────────┘ └─────────┘ │        │          │ ┌──────┐ ┌──────┐ ┌──────┐ │
└─────────────────────────┘        └──────────┴────────────────────────────┘
[Catalogue][Favoris][Cmd][Compte]
```

---

## 6. Client — Item detail (the dossier) ★ hero

**Purpose:** make documented provenance feel like proof. The page reads top-to-bottom as a **dossier**, in three movements; traceability is the **spine**, not a tab.

**1 — Identity nameplate.** `ImageGallery` · `nom` (Archivo display) · `ReferencePlate` with `marque`/`modele` · a single prominent **StateBadge (En vente) + QualityGauge** pairing · `PriceTag` · warranty as a forward promise: *"Garantie 12 mois — active à l'achat."*

**2 — Traceability dossier (signature, most vertical room).** The `TraceabilityTimeline` in read mode as a stamped inspection record: each `EtapeTracabilite` a dated entry in process order. The **`DIAGNOSTIC` step is the visual pivot** — a verdict stamp ("Réparable", verdigris) that visibly gates what follows. For a **salvaged pièce**, the first node is the plain-text provenance line *"Issue de la décomposition de …"* (not a link — BR-09). Terminal node = "Mise en vente" + date.

**3 — Recommendations (`«extend»`, quiet).** "Équipements similaires" (same category / comparable price, FR-11), clearly secondary, never competing with the dossier.

**Buy action:** mobile = **sticky bottom bar** (price + "Acheter") that sits *below the identity fold*, so the first scroll is provenance, not transaction. Desktop = buy module pinned right of the nameplate; dossier still owns the full-width body beneath.

```
MOBILE (scroll)                     DESKTOP
┌─────────────────────────┐        ┌───────────────────────────────────────┐
│ [ image gallery ]       │        │ [ gallery ]   │ NOM (Archivo)          │
│ NOM (Archivo)           │        │               │ REF·marque·modèle      │
│ REF-2208-A · ABB        │        │               │ ●En vente  ▰▰▰▱ grade  │
│ ●En vente   ▰▰▰▱ grade  │        │               │ 480 €                  │
│ 480 €  Garantie 12 mois │        │               │ Garantie 12 mois       │
├─────────────────────────┤        │               │ [ Acheter ]            │
│ DOSSIER DE TRAÇABILITÉ  │        ├───────────────┴────────────────────────┤
│  ① Décomposition  02/03 │        │ DOSSIER DE TRAÇABILITÉ (full width)     │
│  ② Nettoyage      04/03 │        │  ① Décomposition … ② Nettoyage …        │
│  ◆ Diagnostic: Réparable│        │  ◆ Diagnostic: Réparable                │
│  ③ Réparation     08/03 │        │  ③ Réparation … ④ Composition … ⑤ Test  │
│  ⑤ Test · ⑥ Mise vente  │        │  ⑥ Mise en vente                        │
│ ─ Équipements similaires│        │ ─ Équipements similaires (quiet) ─      │
├─────────────────────────┤        └───────────────────────────────────────┘
│ 480 €      [ Acheter ]  │ ← sticky
```

---

## 7. Client — Favoris, Auth, Compte

**Favoris (FR-10, Q5):** saved `EquipmentCard`s. A sold favorite stays as a **dimmed card stamped "Vendu" (steel), buy disabled, dossier link still live** (NFR-03) — a saved item becomes a record, never a dead end. Favorites are never silently removed. Heart toggles optimistically. Empty: *"Aucun favori. Touchez ♡ sur un équipement pour le suivre."*

**Auth (gate-level):** `AuthSheet` appears only at the buy/favorite/commandes gate, states **why** (*"Connectez-vous pour suivre cet équipement"*), offers connexion **or** inscription inline, returns to exact place. Inscription = nom, email, mot de passe (FR-01) only. Password rules shown as help text up front, not as errors after.

**Compte:** deliberately minimal — identity (nom, email) + Déconnexion (FR-03). No invented settings. Mes commandes is its own tab.

---

## 8. Client — Purchase & Mes commandes

**Flow (sequence_achat_client):** Acheter → auth gate if needed → **`ConfirmPurchaseDialog`** (not a fake checkout). The dialog states honestly **"Achat simulé — aucun paiement réel,"** shows item identity + `PriceTag`, and previews the warranty made concrete — *"Garantie 12 mois — valable jusqu'au 19/06/2027"* (compute `dateFinGarantie` at preview). One action: **"Confirmer l'achat."**

**Transactional guard (FR-14, Q5):** on confirm, server re-checks `etatActuel == EN_VENTE` inside the transaction.
- Success → "Achat confirmé," item → `VENDU`, leaves catalog, `Commande` created.
- Lost race → direction, not a generic error: *"Cet article vient d'être vendu."* + path back to catalog. No `Commande` created.

**Mes commandes (FR-15/16):** each `Commande` as a record; `WarrantyStatus` as a **live** value — verdigris *"Sous garantie jusqu'au 24/09/2025 — 4 mois restants"* / steel *"Garantie expirée"* (computed each visit, BR-10). Every order keeps a live link to the item's dossier (survives the sale, NFR-03).

---

## 9. Admin — Offer review, Item editor + Traceability builder, Dashboard

### 9.1 Offer review (`/admin/offres`)
List/detail split. `DataTable` of offers (`designation`, company `nom`, `typePropose`, `prixPropose`, `dateOffre`, status chip), **default-filtered to `EN_ATTENTE`** (matches the sidebar badge). Row → detail panel with all structured fields + gallery and two actions:
- **Rejeter** → `REJETEE`, no item (FR-23).
- **Accepter** → opens the **new item's editor pre-filled** from the offer (reference, marque, modele, categorie, images — FR-22), `etatActuel = EN_RECONDITIONNEMENT`, landing directly at the traceability builder. Accept *is* "start reconditioning."

### 9.2 Item editor + Traceability builder (`/admin/inventaire/:id`) ★ highest risk

Two tabs in one workspace: **Attributs** (FR-24 structured fields) and **Traçabilité** (the builder). The builder is a **two-pane guided** layout:

**Header:** identity + current `etatActuel` `StateBadge` + the **plain-language consequence** (FR-33) — *"En reconditionnement — non visible au catalogue."*

**Left pane — live dossier (the reused `TraceabilityTimeline` in edit mode):** each node has inline **edit / delete / drag-reorder** (FR-30). The admin builds the exact artifact the buyer reads.

**Right pane — `StepPanel`, fork-aware:** leads with the **expected next step(s)** given history + verdict, not a flat list.
- The `DIAGNOSTIC` step exposes a **segmented Réparable / Endommagé** control; recording it **reshapes the panel** → Réparable: Réparation → (Composition if organe) → Test → Mise en vente; Endommagé: Recyclage.
- **"Autre étape…"** escape always allows any type (guards are *soft*).
- **Soft warnings (FR-31)** in brass, **Save stays enabled**: e.g. *"Inhabituel : une composition devrait suivre une décomposition."* Structurally impossible types for the subtype (decompose/compose on a pièce) are absent from suggestions, reachable only via escape + warning.
- Terminal steps state their effect before commit: `MISE_EN_VENTE` → *"Publiera l'objet au catalogue (En vente)"*; `RECYCLAGE` → *"Retirera l'objet (Recyclé)."*

**`DeclarePiecesDialog` (FR-32):** opens when `RECYCLAGE` is added to an **organe**. Title *"Déclarer les pièces récupérables."* Each row **pre-fills marque/modèle/catégorie/images as editable defaults** (shown as inherited) and **requires** nom, unique référence, prix, qualité, garantie + matériau/compatibilité. Skippable and re-openable. On confirm each becomes a child `Composant` (`EN_RECONDITIONNEMENT`) with its provenance node written, appearing in Inventaire to run its own pipeline. No dialog for a pièce or an undamaged organe.

```
ADMIN BUILDER (desktop)
┌──────────┬──────────────────────────────────────────────────────────────┐
│ Sidebar  │ Pompe hydraulique  REF-2208-A   ●En reconditionnement          │
│ Tableau  │ "Non visible au catalogue"            [Attributs][Traçabilité] │
│ Offres ③ │ ┌──────────────────────────┐  ┌──────────────────────────────┐ │
│ Inventaire│ │ DOSSIER (edit)           │  │ AJOUTER UNE ÉTAPE            │ │
│ Catégories│ │ ① Décomposition ✎ ⌫ ⠿   │  │ Suivant suggéré :            │ │
│ Ventes   │ │ ② Nettoyage     ✎ ⌫ ⠿   │  │  ◆ Diagnostic                │ │
│          │ │ ◆ Diagnostic [Réparable]│  │   ( Réparable | Endommagé )  │ │
│          │ │ ③ Réparation    ✎ ⌫ ⠿   │  │ ⚠ brass soft-warning (si…)   │ │
│          │ │ …                       │  │ [ Autre étape… ]  [ Ajouter ]│ │
│          │ └──────────────────────────┘  └──────────────────────────────┘ │
└──────────┴──────────────────────────────────────────────────────────────┘
```

### 9.3 Dashboard (`/admin`)
1. **To-do band first** (above metrics): *"X offres en attente de revue"* → links to filtered offers; quiet/positive when zero.
2. **Metric tiles** in Plex Mono, state-coloured: Offres by status · Inventaire by `etatActuel` · **Revenu simulé = `SUM(Commande.prix)`** (headline weight, never `Composant.prix` — FR-34).
3. **One chart only — the conversion funnel:** En reconditionnement → En vente → Vendu (Recyclé called out). No pies, no time-series (insufficient data = honest-looking noise).
4. Empty: *"Aucune vente pour l'instant — les offres acceptées apparaîtront dans l'inventaire."*

---

## 10. Entreprise — Offer form (`/proposer`)

Single page, **three labeled fieldsets**, no wizard. Intro: *"Proposez un équipement à reconditionner. Nous examinons chaque offre."*

1. **Votre entreprise:** nom, contact, adresse (→ `Entreprise`, non-dedup accepted, FR-19).
2. **L'équipement:** designation · `typePropose` as a **segmented Organe/Pièce** control · marque · modele · reference · categorie (admin-managed list, FR-25) · `etatDeclare` as **three described radios** (Fonctionnel / Partiellement fonctionnel / Défectueux).
3. **Prix & détails:** prixPropose · optional description · **multi-image uploader** with thumbnails.

On submit → clear **confirmation state** (not a redirect into an app shell): *"Offre reçue. Nous reviendrons vers vous."* (status `EN_ATTENTE`, FR-18).

---

## 11. Voice & content guidelines

One register across the product makes it feel authored by one hand.

- **Errors give direction, never apologize, never go vague.** *"Cet article vient d'être vendu."* + the way out — not "Oops, something went wrong."
- **Empty states are invitations**, each pointing at the single next step (catalogue, favoris, commandes, dashboard).
- **An action keeps its verb** start to finish: button "Acheter" → "Confirmer l'achat" → toast "Achat confirmé." "Publier" → "Publié."
- **Name things by what people control**, not by how the system is built ("équipement," "dossier," "garantie" — never "Composant," "EtapeTracabilite").
- **Loading is content-shaped skeletons** on the catalog and dossier — never a bare spinner on the trust surface.
- Sentence case, plain verbs, no filler. French throughout.

---

## 12. Quality floor (non-negotiable)

- **Responsive** down to mobile on client + offer surfaces; admin gated above its breakpoint.
- **Visible keyboard focus** on every interactive element (verdigris focus ring on `atelier`/`panel`).
- **Contrast:** graphite-on-atelier and verdigris-on-panel verified ≥ WCAG AA; never rely on colour alone — pair every `StateBadge` colour with its text label.
- **`prefers-reduced-motion`** removes transitions and reveals.
- **Optimistic UI** (favorite) always reconciles and rolls back visibly on failure.

---

## 13. Build sequence (recommended)

1. **Tokens + shared primitives** — `globals.css`, Tailwind config, `StateBadge`, `QualityGauge`, `ReferencePlate`, `PriceTag`.
2. **`TraceabilityTimeline`** (read mode) — the spine; everything else inherits its visual language.
3. **Item detail (dossier)** — the hero reference screen.
4. **Catalogue** + `EquipmentCard` + filtering.
5. **Purchase + Mes commandes** (incl. `WarrantyStatus`).
6. **Favoris + Auth + Compte.**
7. **Offer form.**
8. **Admin:** Inventory → Editor + **Traceability builder (edit mode of the same timeline)** → Offer review → Dashboard.

---

## 14. Traceability matrix (FR/BR → surface)

| Req | Where it lives |
|---|---|
| FR-01/02/03/04 | §7 Auth/Compte (gate-level) |
| FR-05/06/07 | §5 Catalogue (en-vente only, search, filters) |
| FR-08/09 | §6 Item detail (identity + dossier) |
| FR-10 | §7 Favoris (Vendu records, Q5) |
| FR-11 | §6 Recommendations (quiet `«extend»`) |
| FR-12/13/14 | §8 Purchase (confirm dialog + transactional guard) |
| FR-15/16 / BR-10 | §8 Mes commandes (live `WarrantyStatus`) |
| FR-17/18/19 | §10 Offer form |
| FR-20/21/22/23 | §9.1 Offer review (accept → pre-filled editor) |
| FR-24/25 | §9.2 Attributs tab + §10 categories |
| FR-26/27 (DIAGNOSTIC) | §9.2 StepPanel verdict control |
| FR-28/33 | §9.2 terminal-step consequences + state header |
| FR-30/31 | §9.2 edit/reorder + soft brass warnings |
| FR-32 / BR-03/09 | §9.2 DeclarePiecesDialog (recycle-spawn) |
| FR-34 | §9.3 Dashboard (revenue = `SUM(Commande.prix)`) |
| BR-02/08 (fork) | §6 dossier pivot + §9.2 fork-aware panel |
| NFR-01/02/03/04 | §11 voice · §7 auth/hashing · §6/§8 dossier survives sale · §4 isolated reco component |

---

*End of specification. This document is the design contract; build against §13 in order, deriving every colour and type decision from §2.*
