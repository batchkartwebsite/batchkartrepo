-- Detailed requirement "enquiries" (the multi-step /enquire flow).
-- The existing `queries` table stays as the simple Contact form.
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  exam text,
  class_level text,
  coaching_choices jsonb not null default '[]'::jsonb,
  cities jsonb not null default '[]'::jsonb,
  batch_ids jsonb not null default '[]'::jsonb,
  budget numeric(10,2),
  scholarship_reason text,
  achievements text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
alter table public.enquiries enable row level security;
create index if not exists enquiries_user_id_idx on public.enquiries (user_id);

create policy enquiries_public_insert on public.enquiries
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
create policy enquiries_owner_read on public.enquiries
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy enquiries_admin_all on public.enquiries
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
