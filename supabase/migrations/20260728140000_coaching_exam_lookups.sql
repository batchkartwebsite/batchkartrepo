-- Admin-managed lookup tables that feed the batch form dropdowns.

create table if not exists public.coaching_centers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  logo_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.coaching_centers enable row level security;
create trigger coaching_centers_set_updated_at
  before update on public.coaching_centers for each row execute function public.set_updated_at();
create policy coaching_centers_public_read on public.coaching_centers
  for select to anon, authenticated using (is_active or public.is_admin());
create policy coaching_centers_admin_all on public.coaching_centers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.exams enable row level security;
create trigger exams_set_updated_at
  before update on public.exams for each row execute function public.set_updated_at();
create policy exams_public_read on public.exams
  for select to anon, authenticated using (is_active or public.is_admin());
create policy exams_admin_all on public.exams
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Seed to match existing demo batches so their institute/exam stay selectable.
insert into public.coaching_centers (name, logo_url, sort_order) values
  ('Allen Career Institute','/logos/allen.png',1),
  ('Aakash Institute','/logos/aakash.png',2),
  ('Physics Wallah','/logos/pw.png',3),
  ('FIITJEE','/logos/fiitjee.png',4),
  ('Vajiram & Ravi','/logos/vajiram.png',5),
  ('Drishti IAS','/logos/drishti.png',6),
  ('Unacademy','/logos/unacademy.png',7),
  ('Made Easy','/logos/madeeasy.png',8),
  ('Resonance','/logos/resonance.png',9),
  ('BYJU''S','/logos/byjus.png',10)
on conflict (name) do nothing;

insert into public.exams (name, sort_order) values
  ('NEET',1),('JEE Main',2),('JEE Advanced',3),('UPSC CSE',4),('State PSC',5),
  ('SSC CGL',6),('Bank PO',7),('CAT',8),('GATE',9),('CLAT',10),('NDA',11),
  ('CUET',12),('Board Exams (11-12)',13)
on conflict (name) do nothing;
