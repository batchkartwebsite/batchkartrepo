begin;
select plan(5);

-- Seed: two students, one admin, one published + one draft batch.
insert into auth.users (id, email) values
  ('10000000-0000-0000-0000-000000000001', 'a@test.dev'),
  ('10000000-0000-0000-0000-000000000002', 'b@test.dev'),
  ('10000000-0000-0000-0000-0000000000ad', 'admin@test.dev');
update public.profiles set role = 'admin'
  where id = '10000000-0000-0000-0000-0000000000ad';

insert into public.states (id, name, slug) values
  ('10000000-0000-0000-0000-0000000000aa','S','s-state');
insert into public.coaching_institutes (id, name, slug, moderation_status) values
  ('10000000-0000-0000-0000-0000000000b1','Pub','pub-coaching','published');
insert into public.exam_categories (id, name, slug) values
  ('10000000-0000-0000-0000-0000000000c1','NEET','neet');
insert into public.batches (id, coaching_id, exam_id, name, slug, moderation_status) values
  ('10000000-0000-0000-0000-0000000000d1','10000000-0000-0000-0000-0000000000b1',
   '10000000-0000-0000-0000-0000000000c1','Published B','pub-b','published'),
  ('10000000-0000-0000-0000-0000000000d2','10000000-0000-0000-0000-0000000000b1',
   '10000000-0000-0000-0000-0000000000c1','Draft B','draft-b','draft');

-- Student A owns a requirement post.
insert into public.requirement_posts (id, student_id, description) values
  ('10000000-0000-0000-0000-0000000000e1','10000000-0000-0000-0000-000000000001','A needs coaching');

-- ---- anon sees only published batches ----
set local role anon;
select is(
  (select count(*)::int from public.batches),
  1,
  'anon sees only the published batch'
);

-- ---- authenticated student A sees published batch (not draft) ----
-- Supabase's auth.uid() reads request.jwt.claims->>'sub'. The GUC name has two
-- dots, so it must be set via set_config(), not `SET ... TO`.
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select is(
  (select count(*)::int from public.batches),
  1,
  'student sees only published batch'
);

-- ---- student A sees own requirement; student B does not ----
select is(
  (select count(*)::int from public.requirement_posts),
  1,
  'student A sees own requirement post'
);
select set_config('request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
select is(
  (select count(*)::int from public.requirement_posts),
  0,
  'student B cannot see student A requirement post'
);

-- ---- admin sees both batches (bypass) ----
select set_config('request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-0000000000ad","role":"authenticated"}', true);
select is(
  (select count(*)::int from public.batches),
  2,
  'admin sees published AND draft batches'
);

reset role;
select * from finish();
rollback;
