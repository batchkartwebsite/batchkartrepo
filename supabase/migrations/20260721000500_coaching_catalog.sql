-- coaching_institutes
create table public.coaching_institutes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  cover_url text,
  description text,
  is_verified boolean not null default false,
  rating_avg numeric(3,2) not null default 0,      -- denormalized, maintained by review trigger
  rating_count integer not null default 0,          -- denormalized
  contact_email text,
  contact_phone text,
  website_url text,
  seo jsonb not null default '{}'::jsonb,
  claim_status public.claim_status not null default 'unclaimed',
  moderation_status public.moderation_status not null default 'draft',
  created_by uuid references public.profiles (id) on delete set null,
  reviewed_by uuid references public.profiles (id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
alter table public.coaching_institutes enable row level security;
create trigger coaching_institutes_set_updated_at
  before update on public.coaching_institutes for each row execute function public.set_updated_at();

-- coaching_branches (per-city presence)
create table public.coaching_branches (
  id uuid primary key default gen_random_uuid(),
  coaching_id uuid not null references public.coaching_institutes (id) on delete cascade,
  city_id uuid not null references public.cities (id) on delete restrict,
  address text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  phone text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.coaching_branches enable row level security;
create trigger coaching_branches_set_updated_at
  before update on public.coaching_branches for each row execute function public.set_updated_at();

-- coaching_faculty
create table public.coaching_faculty (
  id uuid primary key default gen_random_uuid(),
  coaching_id uuid not null references public.coaching_institutes (id) on delete cascade,
  name text not null,
  subject text,
  photo_url text,
  experience_years integer,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.coaching_faculty enable row level security;
create trigger coaching_faculty_set_updated_at
  before update on public.coaching_faculty for each row execute function public.set_updated_at();

-- batches
create table public.batches (
  id uuid primary key default gen_random_uuid(),
  coaching_id uuid not null references public.coaching_institutes (id) on delete cascade,
  branch_id uuid references public.coaching_branches (id) on delete set null,
  exam_id uuid not null references public.exam_categories (id) on delete restrict,
  name text not null,
  slug text not null unique,
  teacher text,
  mode public.batch_mode not null default 'offline',
  language public.batch_language not null default 'hinglish',
  fee numeric(10,2),
  discounted_fee numeric(10,2),
  fee_type public.fee_type not null default 'one_time',
  start_date date,
  duration_months integer,
  seats_total integer,
  seats_left integer,
  scholarship_available boolean not null default false,
  curriculum jsonb not null default '{}'::jsonb,
  status public.batch_status not null default 'active',
  moderation_status public.moderation_status not null default 'draft',
  submitted_by uuid references public.profiles (id) on delete set null,
  reviewed_by uuid references public.profiles (id) on delete set null,
  published_at timestamptz,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
alter table public.batches enable row level security;
create trigger batches_set_updated_at
  before update on public.batches for each row execute function public.set_updated_at();

-- Maintain batches.search_vector from name + teacher + curriculum text.
create or replace function public.batches_search_vector_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple', unaccent(coalesce(new.name, ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(new.teacher, ''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce(new.curriculum ->> 'summary', ''))), 'C');
  return new;
end;
$$;

create trigger batches_search_vector_trigger
  before insert or update of name, teacher, curriculum on public.batches
  for each row execute function public.batches_search_vector_update();

-- discounts
create table public.discounts (
  id uuid primary key default gen_random_uuid(),
  coaching_id uuid not null references public.coaching_institutes (id) on delete cascade,
  batch_id uuid references public.batches (id) on delete cascade,
  title text not null,
  percent numeric(5,2),
  amount numeric(10,2),
  code text,
  valid_from date,
  valid_to date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.discounts enable row level security;
create trigger discounts_set_updated_at
  before update on public.discounts for each row execute function public.set_updated_at();

-- faqs (polymorphic parent: coaching or batch)
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  parent_type public.faq_parent_type not null,
  parent_id uuid not null,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.faqs enable row level security;
create trigger faqs_set_updated_at
  before update on public.faqs for each row execute function public.set_updated_at();
