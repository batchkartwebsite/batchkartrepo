-- states
create table public.states (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.states enable row level security;
create trigger states_set_updated_at
  before update on public.states for each row execute function public.set_updated_at();

-- cities
create table public.cities (
  id uuid primary key default gen_random_uuid(),
  state_id uuid not null references public.states (id) on delete restrict,
  name text not null,
  slug text not null unique,
  is_popular boolean not null default false,
  latitude numeric(9,6),
  longitude numeric(9,6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.cities enable row level security;
create trigger cities_set_updated_at
  before update on public.cities for each row execute function public.set_updated_at();

-- Now that cities exists, wire the deferred profiles.city_id FK.
alter table public.profiles
  add constraint profiles_city_id_fkey
  foreign key (city_id) references public.cities (id) on delete set null;

-- exam_categories (self-referencing for sub-exams)
create table public.exam_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  parent_id uuid references public.exam_categories (id) on delete set null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  seo jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.exam_categories enable row level security;
create trigger exam_categories_set_updated_at
  before update on public.exam_categories for each row execute function public.set_updated_at();
