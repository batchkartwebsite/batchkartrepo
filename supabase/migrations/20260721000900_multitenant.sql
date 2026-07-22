-- coaching_members
create table public.coaching_members (
  id uuid primary key default gen_random_uuid(),
  coaching_id uuid not null references public.coaching_institutes (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  member_role public.member_role not null default 'editor',
  all_branches boolean not null default false,
  status public.member_status not null default 'invited',
  invited_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (coaching_id, profile_id)
);
alter table public.coaching_members enable row level security;
create trigger coaching_members_set_updated_at
  before update on public.coaching_members for each row execute function public.set_updated_at();

-- coaching_member_branches (per-city scope when all_branches = false)
create table public.coaching_member_branches (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.coaching_members (id) on delete cascade,
  branch_id uuid not null references public.coaching_branches (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (member_id, branch_id)
);
alter table public.coaching_member_branches enable row level security;

-- coaching_claims (coaching_id null = request to create a new listing)
create table public.coaching_claims (
  id uuid primary key default gen_random_uuid(),
  coaching_id uuid references public.coaching_institutes (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  document_id uuid references public.student_documents (id) on delete set null,
  status public.discount_request_status not null default 'pending',  -- reuse pending/approved/rejected
  reviewed_by uuid references public.profiles (id) on delete set null,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.coaching_claims enable row level security;
create trigger coaching_claims_set_updated_at
  before update on public.coaching_claims for each row execute function public.set_updated_at();
