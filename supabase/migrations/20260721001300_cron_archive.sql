create extension if not exists pg_cron;

-- Flip active requirement posts to archived once their study_start_date has passed.
create or replace function public.archive_expired_requirements()
returns void
language sql
as $$
  update public.requirement_posts
  set status = 'archived'
  where status = 'active'
    and study_start_date is not null
    and study_start_date < current_date;
$$;

-- Nightly at 01:00 UTC. Unschedule first so the migration is idempotent on reset.
select cron.unschedule('archive-expired-requirements')
where exists (select 1 from cron.job where jobname = 'archive-expired-requirements');

select cron.schedule(
  'archive-expired-requirements',
  '0 1 * * *',
  $$ select public.archive_expired_requirements(); $$
);
