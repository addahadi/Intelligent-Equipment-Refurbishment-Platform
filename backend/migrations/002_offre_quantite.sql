-- Migration 002 — quantity on offers (World A: offer-stage quantity, fan-out
-- into unique composants on acceptance). Safe on an existing database, idempotent.
--
--   psql "$DATABASE_URL" -f backend/migrations/002_offre_quantite.sql
--
-- prix_propose is reinterpreted as PER UNIT (qty-1 rows are identical either way,
-- so no data migration is needed).

alter table public.offre
  add column if not exists quantite int not null default 1;

alter table public.offre
  add column if not exists quantite_acceptee int;

-- Constraints (guarded so re-running does not error).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'offre_quantite_range') then
    alter table public.offre
      add constraint offre_quantite_range check (quantite >= 1 and quantite <= 100);
  end if; 
  if not exists (select 1 from pg_constraint where conname = 'offre_quantite_acceptee_range') then
    alter table public.offre
      add constraint offre_quantite_acceptee_range check (
        quantite_acceptee is null
        or (quantite_acceptee >= 1 and quantite_acceptee <= quantite)
      );
  end if;
end $$;

-- Backfill: existing accepted offers took their single item.
update public.offre
   set quantite_acceptee = 1
 where statut = 'ACCEPTEE' and quantite_acceptee is null;
