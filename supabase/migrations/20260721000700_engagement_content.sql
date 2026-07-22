-- blog_categories
create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.blog_categories enable row level security;
create trigger blog_categories_set_updated_at
  before update on public.blog_categories for each row execute function public.set_updated_at();

-- blog_posts
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles (id) on delete set null,
  category_id uuid references public.blog_categories (id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text,
  cover_url text,
  content text,
  reading_time integer,
  status public.blog_status not null default 'draft',
  published_at timestamptz,
  seo jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.blog_posts enable row level security;
create trigger blog_posts_set_updated_at
  before update on public.blog_posts for each row execute function public.set_updated_at();

-- reviews (coaching-level only)
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  coaching_id uuid not null references public.coaching_institutes (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  title text,
  body text,
  status public.review_status not null default 'pending',
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.reviews enable row level security;
create trigger reviews_set_updated_at
  before update on public.reviews for each row execute function public.set_updated_at();

-- Recompute coaching_institutes.rating_avg / rating_count from APPROVED reviews.
create or replace function public.recompute_coaching_rating()
returns trigger
language plpgsql
as $$
declare
  target_coaching uuid := coalesce(new.coaching_id, old.coaching_id);
begin
  update public.coaching_institutes c
  set rating_avg = coalesce(agg.avg_rating, 0),
      rating_count = coalesce(agg.cnt, 0)
  from (
    select avg(rating)::numeric(3,2) as avg_rating, count(*) as cnt
    from public.reviews
    where coaching_id = target_coaching and status = 'approved'
  ) agg
  where c.id = target_coaching;
  return null;  -- AFTER trigger
end;
$$;

create trigger reviews_recompute_rating
  after insert or update or delete on public.reviews
  for each row execute function public.recompute_coaching_rating();

-- testimonials (admin-curated)
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  exam text,
  avatar_url text,
  quote text not null,
  rating smallint check (rating between 1 and 5),
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.testimonials enable row level security;
create trigger testimonials_set_updated_at
  before update on public.testimonials for each row execute function public.set_updated_at();

-- newsletter_subscribers
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  status public.newsletter_status not null default 'subscribed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;
create trigger newsletter_subscribers_set_updated_at
  before update on public.newsletter_subscribers for each row execute function public.set_updated_at();
