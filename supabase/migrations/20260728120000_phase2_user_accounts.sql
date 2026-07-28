-- Phase 2: users can track the enquiries they submit.

-- 1. Link queries to the submitting user (nullable — anon enquiries stay null).
alter table public.queries
  add column if not exists user_id uuid references auth.users (id) on delete set null;
create index if not exists queries_user_id_idx on public.queries (user_id);

-- 2. Tighten insert (no spoofing another user's id) + let owners read their own.
drop policy if exists queries_public_insert on public.queries;
create policy queries_public_insert on public.queries
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

drop policy if exists queries_owner_read on public.queries;
create policy queries_owner_read on public.queries
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- 3. Capture full_name + phone from signup metadata into the profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
