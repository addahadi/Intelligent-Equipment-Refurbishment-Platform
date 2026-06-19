-- =====================================================================
--  PLATEFORME DE RECONDITIONNEMENT INTELLIGENT
--  PostgreSQL schema — bilingual FR + AR
--  (Plain Postgres: no RLS, no Supabase Auth — auth handled in the app.)
-- ---------------------------------------------------------------------
--  Conventions
--   * snake_case identifiers (Postgres-idiomatic).
--   * Translatable human-readable text  -> two columns  *_fr / *_ar.
--   * Factual / proper-noun data (email, marque, modele, reference,
--     person & company names, prices, dates) stays single-column.
--   * Passwords are stored HASHED, never in plain text (NFR-02). Hash in
--     your app layer, or with pgcrypto's crypt()/gen_salt() if preferred.
--   * Every table carries created_at + updated_at (auto-maintained).
--  Run order: extensions -> enums -> helper -> tables -> indexes
--             -> triggers -> purchase function -> seed notes.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. EXTENSIONS
-- ---------------------------------------------------------------------
create extension if not exists pgcrypto;   -- optional: crypt()/gen_salt() for password hashing
create extension if not exists pg_trgm;     -- fuzzy / keyword search

-- ---------------------------------------------------------------------
-- 1. ENUMERATED TYPES  (mirror the class-diagram enums)
-- ---------------------------------------------------------------------
create type role_utilisateur as enum ('CLIENT', 'ADMINISTRATEUR');

create type type_composant   as enum ('ORGANE', 'PIECE');

create type etat_composant   as enum (
  'EN_RECONDITIONNEMENT', 'EN_VENTE', 'VENDU', 'RECYCLE'
);

create type qualite_etat     as enum (
  'COMME_NEUF', 'TRES_BON', 'BON', 'CORRECT'
);

create type statut_offre     as enum ('EN_ATTENTE', 'ACCEPTEE', 'REJETEE');

create type etat_declare     as enum (
  'FONCTIONNEL', 'PARTIELLEMENT_FONCTIONNEL', 'DEFECTUEUX'
);

create type statut_commande  as enum ('SIMULEE', 'CONFIRMEE');

create type type_etape       as enum (
  'DECOMPOSITION', 'NETTOYAGE', 'DIAGNOSTIC', 'REPARATION',
  'COMPOSITION', 'TEST', 'MISE_EN_VENTE', 'RECYCLAGE'
);

-- ---------------------------------------------------------------------
-- 2. SHARED HELPER — updated_at auto-touch trigger function
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- 3. TABLES
-- =====================================================================

-- ---------------------------------------------------------------------
-- 3.1  PROFIL  (= Utilisateur + Client + Administrateur, single table)
--   role discriminates the actor; telephone/adresse are Client-only.
--   mot_de_passe_hash stores a HASH, never a plain password (NFR-02).
-- ---------------------------------------------------------------------
create table public.profil (
  id                bigint generated always as identity primary key,
  role              role_utilisateur not null default 'CLIENT',
  nom               text not null,                 -- proper noun -> not translated
  email             text not null unique,
  mot_de_passe_hash text not null,                 -- hashed credential
  telephone         text,                          -- client only
  adresse           text,                          -- client only
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3.2  ENTREPRISE  (anonymous maintenance service, FR-17..FR-19)
--   Captured per submission, NOT deduplicated (accepted limitation).
-- ---------------------------------------------------------------------
create table public.entreprise (
  id          bigint generated always as identity primary key,
  nom         text not null,                       -- company name -> proper noun
  contact     text not null,
  adresse     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3.3  CATEGORIE  (FR-25) — libelle is bilingual
-- ---------------------------------------------------------------------
create table public.categorie (
  id          bigint generated always as identity primary key,
  libelle_fr  text not null,
  libelle_ar  text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3.4  OFFRE  (FR-17..FR-23) — designation & description bilingual
-- ---------------------------------------------------------------------
create table public.offre (
  id             bigint generated always as identity primary key,
  entreprise_id  bigint not null references public.entreprise (id) on delete restrict,
  categorie_id   bigint references public.categorie (id) on delete set null,
  designation_fr text not null,
  designation_ar text,
  type_propose   type_composant not null,
  marque         text,                             -- brand -> proper noun
  modele         text,                             -- model -> proper noun
  reference      text,
  etat_declare   etat_declare not null,
  prix_propose   numeric(12,2) not null check (prix_propose >= 0),  -- BR-07
  images         text[] not null default '{}',     -- gallery (storage URLs)
  description_fr text,
  description_ar text,
  date_offre     date not null default current_date,
  statut         statut_offre not null default 'EN_ATTENTE',        -- FR-18
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3.5  COMPOSANT  (= abstract Composant + Organe + Piece)
--   Single-Table Inheritance: type_composant discriminates ORGANE/PIECE.
--   Organes and pièces render interchangeably in the app (BR-09), so one
--   table keeps the catalog, traceability and detail views uniform.
-- ---------------------------------------------------------------------
create table public.composant (
  id                bigint generated always as identity primary key,
  type_composant    type_composant not null,
  nom_fr            text not null,
  nom_ar            text,
  reference         text not null unique,          -- BR-04 unique item
  marque            text,                          -- proper noun
  modele            text,                          -- proper noun
  categorie_id      bigint references public.categorie (id) on delete set null,
  qualite           qualite_etat,
  prix              numeric(12,2) not null check (prix >= 0),       -- sale price (BR-07)
  garantie          int not null default 0 check (garantie >= 0),   -- months (BR-10)
  images            text[] not null default '{}',
  description_fr    text,
  description_ar    text,
  etat_actuel       etat_composant not null default 'EN_RECONDITIONNEMENT',  -- FR-33
  date_publication  date,
  -- provenance / lineage
  offre_id          bigint references public.offre (id) on delete set null,      -- FR-22 "genere"
  organe_parent_id  bigint references public.composant (id) on delete set null,  -- BR-05/BR-09
  -- ORGANE-specific (bilingual)
  type_equipement_fr text,
  type_equipement_ar text,
  -- PIECE-specific (bilingual)
  materiau_fr        text,
  materiau_ar        text,
  compatibilite_fr   text,
  compatibilite_ar   text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  -- STI integrity guards ------------------------------------------------
  constraint chk_organe_fields check (
    type_composant = 'ORGANE'
    or (type_equipement_fr is null and type_equipement_ar is null)
  ),
  constraint chk_piece_fields check (
    type_composant = 'PIECE'
    or (materiau_fr is null and materiau_ar is null
        and compatibilite_fr is null and compatibilite_ar is null)
  ),
  constraint chk_parent_only_for_piece check (
    organe_parent_id is null or type_composant = 'PIECE'
  )
);

-- ---------------------------------------------------------------------
-- 3.6  ETAPE_TRACABILITE  (FR-26..FR-31) — description bilingual
--   "ordre" is unique per composant so the timeline is strictly ordered.
-- ---------------------------------------------------------------------
create table public.etape_tracabilite (
  id              bigint generated always as identity primary key,
  composant_id    bigint not null references public.composant (id) on delete cascade,
  type            type_etape not null,
  ordre           int not null check (ordre >= 0),
  date            date not null default current_date,
  description_fr  text,                            -- holds DIAGNOSTIC verdict (BR-08)
  description_ar  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (composant_id, ordre)
);

-- ---------------------------------------------------------------------
-- 3.7  COMMANDE  (FR-12..FR-16) — simulated purchase
--   prix is SNAPSHOTTED at purchase time (FR-34 revenue = SUM(commande.prix)).
--   One commande per composant enforces "unique item, no double-sale" (BR-04/06).
-- ---------------------------------------------------------------------
create table public.commande (
  id                 bigint generated always as identity primary key,
  client_id          bigint not null references public.profil (id) on delete restrict,
  composant_id       bigint not null references public.composant (id) on delete restrict,
  date               date not null default current_date,
  prix               numeric(12,2) not null check (prix >= 0),  -- snapshot
  date_fin_garantie  date,                                       -- BR-10
  statut             statut_commande not null default 'SIMULEE',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (composant_id)                                          -- one sale per unique item
);

-- ---------------------------------------------------------------------
-- 3.8  FAVORI  (FR-10) — many-to-many Client <-> Composant
-- ---------------------------------------------------------------------
create table public.favori (
  client_id     bigint not null references public.profil (id) on delete cascade,
  composant_id  bigint not null references public.composant (id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (client_id, composant_id)
);

-- =====================================================================
-- 4. INDEXES  (search FR-06 + filters FR-07 + common lookups)
-- =====================================================================
create index idx_composant_etat       on public.composant (etat_actuel);
create index idx_composant_categorie  on public.composant (categorie_id);
create index idx_composant_type       on public.composant (type_composant);
create index idx_composant_marque     on public.composant (marque);
create index idx_composant_qualite    on public.composant (qualite);
create index idx_composant_prix       on public.composant (prix);
create index idx_composant_parent     on public.composant (organe_parent_id);

-- Keyword search across both languages (FR-06). 'simple' config is
-- language-agnostic, which suits a mixed FR/AR corpus.
alter table public.composant
  add column search_vector tsvector
  generated always as (
    to_tsvector('simple',
      coalesce(nom_fr,'')        || ' ' || coalesce(nom_ar,'')        || ' ' ||
      coalesce(description_fr,'')|| ' ' || coalesce(description_ar,'')|| ' ' ||
      coalesce(marque,'')        || ' ' || coalesce(modele,'')        || ' ' ||
      coalesce(reference,'')
    )
  ) stored;
create index idx_composant_search on public.composant using gin (search_vector);

create index idx_offre_entreprise   on public.offre (entreprise_id);
create index idx_offre_statut       on public.offre (statut);
create index idx_etape_composant    on public.etape_tracabilite (composant_id);
create index idx_commande_client    on public.commande (client_id);

-- =====================================================================
-- 5. updated_at TRIGGERS  (one per table)
-- =====================================================================
create trigger trg_profil_updated      before update on public.profil            for each row execute function public.set_updated_at();
create trigger trg_entreprise_updated  before update on public.entreprise        for each row execute function public.set_updated_at();
create trigger trg_categorie_updated   before update on public.categorie         for each row execute function public.set_updated_at();
create trigger trg_offre_updated       before update on public.offre             for each row execute function public.set_updated_at();
create trigger trg_composant_updated   before update on public.composant         for each row execute function public.set_updated_at();
create trigger trg_etape_updated       before update on public.etape_tracabilite for each row execute function public.set_updated_at();
create trigger trg_commande_updated    before update on public.commande          for each row execute function public.set_updated_at();

-- =====================================================================
-- 6. PURCHASE TRANSACTION  (FR-13/FR-14/FR-16, BR-04/BR-06/BR-10)
--   Re-checks EN_VENTE under a row lock, then creates the commande and
--   flips the state atomically => no double-sale of a unique item.
--   Pass the buyer's profil id from your app:
--     select * from acheter_composant(:client_id, :composant_id);
-- =====================================================================
create or replace function public.acheter_composant(
  p_client_id    bigint,
  p_composant_id bigint
)
returns public.commande
language plpgsql
as $$
declare
  v_item     public.composant%rowtype;
  v_commande public.commande%rowtype;
begin
  -- Lock the candidate row for the duration of the transaction.
  select * into v_item from public.composant
   where id = p_composant_id for update;

  if not found then
    raise exception 'Composant introuvable';
  end if;

  if v_item.etat_actuel <> 'EN_VENTE' then
    raise exception 'Cet article vient d''être vendu';         -- FR-14
  end if;

  insert into public.commande
    (client_id, composant_id, date, prix, date_fin_garantie, statut)
  values
    (p_client_id, v_item.id, current_date, v_item.prix,
     current_date + make_interval(months => v_item.garantie),  -- BR-10
     'CONFIRMEE')
  returning * into v_commande;

  update public.composant
     set etat_actuel = 'VENDU'
   where id = v_item.id;

  return v_commande;
end;
$$;

-- =====================================================================
-- 7. SEED NOTES (run manually after deployment)
-- ---------------------------------------------------------------------
--  Admin provisioning (FR-01 note): there is NO admin sign-up UI. Insert
--  one administrator directly. Store a HASH, not a plain password —
--  hash in your app, or with pgcrypto as shown below:
--
--    insert into public.profil (role, nom, email, mot_de_passe_hash)
--    values ('ADMINISTRATEUR', 'Admin', 'admin@example.com',
--            crypt('CHANGE_ME', gen_salt('bf')));
--
--  Verify a login later with:
--    select id from public.profil
--     where email = :email and mot_de_passe_hash = crypt(:password, mot_de_passe_hash);
--
--  Example category seed:
--    insert into public.categorie (libelle_fr, libelle_ar) values
--      ('Moteur', 'محرك'),
--      ('Carte électronique', 'بطاقة إلكترونية');
-- =====================================================================
