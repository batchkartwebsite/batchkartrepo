-- V1 simplification.
-- Keep: profiles, admin_users, audit_logs (auth/audit) and batches (standalone).
-- Add: queries (public enquiries). Drop everything else.

-- 1. Unschedule the archive cron + drop its function (touches requirement_posts).
select cron.unschedule('archive-expired-requirements')
where exists (select 1 from cron.job where jobname = 'archive-expired-requirements');
drop function if exists public.archive_expired_requirements();

-- 2. Drop batches policies that depend on the coaching-ownership model.
drop policy if exists batches_public_read on public.batches;
drop policy if exists batches_member_manage on public.batches;

-- 3. Drop all unused tables (CASCADE clears their policies/triggers/FKs,
--    including batches' FK constraints to coaching/exam/branch).
drop table if exists
  public.coaching_claims,
  public.coaching_member_branches,
  public.coaching_members,
  public.reports,
  public.media,
  public.newsletter_subscribers,
  public.testimonials,
  public.reviews,
  public.blog_posts,
  public.blog_categories,
  public.batch_contacts,
  public.saved_batches,
  public.discount_requests,
  public.requirement_posts,
  public.student_preferences,
  public.student_documents,
  public.faqs,
  public.discounts,
  public.coaching_faculty,
  public.coaching_branches,
  public.coaching_institutes,
  public.exam_categories,
  public.cities,
  public.states,
  public.notifications,
  public.settings
cascade;

-- 4. Drop coaching-ownership RLS helpers (now orphaned).
drop function if exists public.can_manage_branch(uuid, uuid);
drop function if exists public.is_active_member_of(uuid);

-- 5. Make batches a standalone listing.
alter table public.batches
  drop column if exists coaching_id,
  drop column if exists exam_id,
  drop column if exists branch_id,
  add column if not exists institute_name text,
  add column if not exists exam text,
  add column if not exists city text,
  add column if not exists description text,
  add column if not exists contact_phone text;

-- 6. Simple public-read policy for batches (batches_admin_all is retained).
create policy batches_public_read on public.batches
  for select to anon, authenticated
  using (moderation_status = 'published' or public.is_admin());

-- 7. Public enquiries ("queries") table.
create table public.queries (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.batches (id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
alter table public.queries enable row level security;

create policy queries_public_insert on public.queries
  for insert to anon, authenticated with check (true);

create policy queries_admin_all on public.queries
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
