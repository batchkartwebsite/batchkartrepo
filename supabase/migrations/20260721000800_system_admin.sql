-- media library
create table public.media (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid references public.profiles (id) on delete set null,
  url text not null,
  type text,
  size integer,
  folder text,
  alt_text text,
  width integer,
  height integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.media enable row level security;
create trigger media_set_updated_at
  before update on public.media for each row execute function public.set_updated_at();

-- audit_logs (every admin write)
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  changes jsonb not null default '{}'::jsonb,   -- { before, after }
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);
alter table public.audit_logs enable row level security;

-- reports (moderation queue)
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles (id) on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  reason text not null,
  status public.report_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.reports enable row level security;
create trigger reports_set_updated_at
  before update on public.reports for each row execute function public.set_updated_at();

-- settings (feature flags, homepage config, SEO defaults)
create table public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  "group" public.settings_group not null default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;
create trigger settings_set_updated_at
  before update on public.settings for each row execute function public.set_updated_at();
