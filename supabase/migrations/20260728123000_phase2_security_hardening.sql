-- Security-advisor follow-ups (safe subset).
-- Close mutable search_path warnings on the active trigger functions.
alter function public.set_updated_at() set search_path = public;
alter function public.batches_search_vector_update() set search_path = public;

-- Drop a function orphaned by the V1 cleanup (referenced reviews/coaching, both dropped).
drop function if exists public.recompute_coaching_rating() cascade;
