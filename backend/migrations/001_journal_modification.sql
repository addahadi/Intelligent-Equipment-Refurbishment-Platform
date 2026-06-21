-- Migration 001 — audit trail for overridden edits on SOLD composants.
-- Safe to run against an existing database (no data loss). Idempotent.
--
--   psql "$DATABASE_URL" -f backend/migrations/001_journal_modification.sql
--
create table if not exists public.journal_modification (
  id            bigint generated always as identity primary key,
  composant_id  bigint not null references public.composant (id) on delete cascade,
  profil_id     bigint not null references public.profil (id)    on delete restrict,
  date          timestamptz not null default now(),
  operation     text not null,   -- COMPOSANT_UPDATE | ETAPE_CREATE | ETAPE_UPDATE | ETAPE_DELETE | ETAPE_REORDER
  motif         text not null,
  details       jsonb not null   -- { "before": {...}, "after": {...} }
);

create index if not exists idx_journal_composant
  on public.journal_modification (composant_id);
