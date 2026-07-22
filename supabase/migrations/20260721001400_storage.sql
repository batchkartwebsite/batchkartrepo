-- Buckets: public media/avatars/covers; private student documents.
insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('media', 'media', true),
  ('documents', 'documents', false)
on conflict (id) do nothing;

-- Public buckets: anyone can read.
create policy "public read avatars" on storage.objects
  for select to anon, authenticated using (bucket_id = 'avatars');
create policy "public read media" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');

-- Authenticated users upload to avatars under their own uid folder.
create policy "user uploads avatar" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Admins fully manage media bucket.
create policy "admin manage media" on storage.objects
  for all to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

-- documents (private): owner reads/writes own uid folder; admin all.
create policy "owner rw documents" on storage.objects
  for all to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "admin read documents" on storage.objects
  for select to authenticated
  using (bucket_id = 'documents' and public.is_admin());
