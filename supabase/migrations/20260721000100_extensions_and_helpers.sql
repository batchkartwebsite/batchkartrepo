-- Extensions used across the schema.
create extension if not exists pgcrypto;      -- gen_random_uuid()
create extension if not exists citext;        -- case-insensitive email/slug where useful
create extension if not exists pg_trgm;       -- trigram indexes for autocomplete
create extension if not exists unaccent;      -- accent-insensitive search normalization

-- Shared trigger function: touch updated_at on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Generic BEFORE UPDATE trigger: sets updated_at to now().';
