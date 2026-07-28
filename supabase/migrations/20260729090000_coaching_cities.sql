-- Cities per coaching center → feed the batch form's city dropdown.
create table if not exists public.coaching_cities (
  id uuid primary key default gen_random_uuid(),
  coaching_id uuid not null references public.coaching_centers (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (coaching_id, name)
);
alter table public.coaching_cities enable row level security;
create policy coaching_cities_public_read on public.coaching_cities
  for select to anon, authenticated using (true);
create policy coaching_cities_admin_all on public.coaching_cities
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Seed a few realistic cities for the seeded centers.
insert into public.coaching_cities (coaching_id, name)
select c.id, x.city
from public.coaching_centers c
join (values
  ('Allen Career Institute','Kota'),
  ('Allen Career Institute','Delhi'),
  ('Allen Career Institute','Jaipur'),
  ('Aakash Institute','Delhi'),
  ('Aakash Institute','Mumbai'),
  ('Physics Wallah','Online'),
  ('FIITJEE','Delhi'),
  ('Vajiram & Ravi','Delhi'),
  ('Drishti IAS','Delhi'),
  ('Drishti IAS','Prayagraj'),
  ('Unacademy','Online'),
  ('Made Easy','Delhi'),
  ('Resonance','Kota'),
  ('BYJU''S','Online')
) as x(coaching, city) on x.coaching = c.name
on conflict (coaching_id, name) do nothing;
