begin;
select plan(4);

-- 1) Inserting an auth user auto-creates a profile.
insert into auth.users (id, email, raw_user_meta_data)
values ('00000000-0000-0000-0000-000000000001', 'stu@test.dev',
        '{"full_name":"Test Student"}'::jsonb);
select is(
  (select full_name from public.profiles where id = '00000000-0000-0000-0000-000000000001'),
  'Test Student',
  'handle_new_user auto-creates profile from metadata'
);

-- 2) updated_at is refreshed by the trigger on UPDATE.
-- now() is constant for the whole transaction, so updated_at == created_at here and
-- a `> created_at` comparison can't detect the trigger. Instead we write a deliberately
-- stale updated_at and assert set_updated_at() overrode it with the transaction time.
update public.profiles
  set phone = '99999',
      updated_at = timestamptz '2000-01-01 00:00:00+00'
  where id = '00000000-0000-0000-0000-000000000001';
select ok(
  (select updated_at > timestamptz '2020-01-01 00:00:00+00' from public.profiles
   where id = '00000000-0000-0000-0000-000000000001'),
  'set_updated_at overrides a stale updated_at with the current timestamp'
);

-- 3) Approved review recomputes coaching rating.
insert into public.states (id, name, slug) values
  ('00000000-0000-0000-0000-0000000000aa','Test State','test-state');
insert into public.coaching_institutes (id, name, slug, moderation_status)
  values ('00000000-0000-0000-0000-0000000000b1','Acme','acme','published');
insert into public.reviews (author_id, coaching_id, rating, status)
  values ('00000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-0000000000b1', 4, 'approved');
select is(
  (select rating_count from public.coaching_institutes
   where id = '00000000-0000-0000-0000-0000000000b1'),
  1,
  'approved review increments coaching rating_count'
);

-- 4) Batch search_vector is populated on insert.
insert into public.exam_categories (id, name, slug)
  values ('00000000-0000-0000-0000-0000000000c1','JEE','jee');
insert into public.batches (id, coaching_id, exam_id, name, slug, teacher)
  values ('00000000-0000-0000-0000-0000000000d1',
          '00000000-0000-0000-0000-0000000000b1',
          '00000000-0000-0000-0000-0000000000c1',
          'JEE Rankers 2027', 'jee-rankers-2027', 'R. Sharma');
select ok(
  (select search_vector @@ to_tsquery('simple', 'rankers') from public.batches
   where id = '00000000-0000-0000-0000-0000000000d1'),
  'batches_search_vector_update populates tsvector on insert'
);

select * from finish();
rollback;
