-- student_documents FIRST (referenced by discount_requests.document_id)
create table public.student_documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  file_url text not null,
  file_size integer,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.student_documents enable row level security;
create trigger student_documents_set_updated_at
  before update on public.student_documents for each row execute function public.set_updated_at();

-- student_preferences (onboarding steps 1-3; always editable)
create table public.student_preferences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  language public.batch_language,
  study_mode public.batch_mode,
  target_exam_id uuid references public.exam_categories (id) on delete set null,
  target_year integer,
  preferred_city_id uuid references public.cities (id) on delete set null,
  preferred_coaching text,
  budget_min numeric(10,2),
  budget_max numeric(10,2),
  fee_type public.fee_type,
  study_start_date date,
  contact_time text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.student_preferences enable row level security;
create trigger student_preferences_set_updated_at
  before update on public.student_preferences for each row execute function public.set_updated_at();

-- requirement_posts
create table public.requirement_posts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  exam_id uuid references public.exam_categories (id) on delete set null,
  city_id uuid references public.cities (id) on delete set null,
  budget_min numeric(10,2),
  budget_max numeric(10,2),
  mode public.batch_mode,
  language public.batch_language,
  target_year integer,
  study_start_date date,
  description text,
  status public.requirement_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.requirement_posts enable row level security;
create trigger requirement_posts_set_updated_at
  before update on public.requirement_posts for each row execute function public.set_updated_at();

-- discount_requests
create table public.discount_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  batch_id uuid references public.batches (id) on delete set null,
  reason_type public.discount_reason not null,
  reason_text text,
  document_id uuid references public.student_documents (id) on delete set null,
  status public.discount_request_status not null default 'pending',
  admin_note text,
  reviewed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.discount_requests enable row level security;
create trigger discount_requests_set_updated_at
  before update on public.discount_requests for each row execute function public.set_updated_at();

-- saved_batches
create table public.saved_batches (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  batch_id uuid not null references public.batches (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (student_id, batch_id)
);
alter table public.saved_batches enable row level security;

-- batch_contacts
create table public.batch_contacts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  batch_id uuid not null references public.batches (id) on delete cascade,
  status public.batch_contact_status not null default 'contacted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.batch_contacts enable row level security;
create trigger batch_contacts_set_updated_at
  before update on public.batch_contacts for each row execute function public.set_updated_at();
