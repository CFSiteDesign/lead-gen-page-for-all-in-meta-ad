-- ALL IN Meta ad landing page — lead capture.
-- Applied to the Lovable Cloud (Supabase) database for project
-- dd20555c-e6eb-4512-a003-bdd808d48925. Kept here as the source of record.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text not null,
  nationality text not null,
  -- attribution captured from the ad click
  source text default 'all-in-meta-ad',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  fbclid text,
  referrer text,
  user_agent text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (lower(email));

alter table public.leads enable row level security;

-- The public page may only INSERT. No anon SELECT/UPDATE/DELETE policy exists,
-- so leads cannot be read back with the publishable key.
drop policy if exists "anon can insert leads" on public.leads;
create policy "anon can insert leads"
  on public.leads
  for insert
  to anon, authenticated
  with check (true);

-- Read access is deliberately NOT granted to `anon`: the publishable key ships
-- in a public bundle, so an anon SELECT policy would let anyone dump the list.
-- Only a signed-in session may read.
--
-- NOTE: this grants read to ANY authenticated user. If public sign-up is ever
-- enabled on this project, tighten the `using` clause to a specific admin
-- user id or a role claim before shipping.
drop policy if exists "authenticated can read leads" on public.leads;
create policy "authenticated can read leads"
  on public.leads
  for select
  to authenticated
  using (true);
