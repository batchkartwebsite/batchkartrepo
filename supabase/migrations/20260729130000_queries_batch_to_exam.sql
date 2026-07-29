-- Contact form now captures an optional exam instead of a specific batch.
alter table public.queries add column if not exists exam text;
alter table public.queries drop column if exists batch_id;
