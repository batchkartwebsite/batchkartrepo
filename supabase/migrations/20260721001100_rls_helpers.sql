-- Current user's role, read from profiles. STABLE + SECURITY DEFINER so policies
-- can call it without recursing into profiles' own RLS.
create or replace function public.current_profile_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Is the current user an ACTIVE member of the given coaching? (coaching_admin scoping)
create or replace function public.is_active_member_of(target_coaching uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.coaching_members m
    where m.coaching_id = target_coaching
      and m.profile_id = auth.uid()
      and m.status = 'active'
  );
$$;

-- Can the current user manage a row belonging to (coaching, branch)?
-- True when an active membership exists AND (all_branches OR the branch is in scope).
-- branch may be null (coaching-level rows) -> requires all_branches.
create or replace function public.can_manage_branch(target_coaching uuid, target_branch uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.coaching_members m
    where m.coaching_id = target_coaching
      and m.profile_id = auth.uid()
      and m.status = 'active'
      and (
        m.all_branches
        or (
          target_branch is not null
          and exists (
            select 1 from public.coaching_member_branches mb
            where mb.member_id = m.id and mb.branch_id = target_branch
          )
        )
      )
  );
$$;
