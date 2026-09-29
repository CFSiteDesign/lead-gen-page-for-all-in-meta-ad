-- Marketing consent for the Global WhatsApp / SMS / email sales messaging.
--
-- The point is to be able to PROVE consent later, not merely to assert it, so
-- the row keeps the exact wording shown and a server-side timestamp alongside
-- the flag. Applied to the Lovable Cloud database on 2026-09-29.

alter table public.leads
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists marketing_consent_at timestamptz,
  add column if not exists marketing_consent_text text,
  add column if not exists marketing_consent_version text;

create index if not exists leads_marketing_consent_idx
  on public.leads (marketing_consent) where marketing_consent;

comment on column public.leads.marketing_consent is
  'True only if the visitor actively ticked the unticked-by-default consent box.';
comment on column public.leads.marketing_consent_text is
  'Verbatim wording the visitor agreed to, captured at submit time.';

-- The timestamp is evidence, so it must not come from the visitor's browser
-- clock. The server stamps it, and scrubs the proof fields on any row that
-- does not actually carry consent, so a forged record cannot be inserted
-- through the public anon key.
create or replace function public.stamp_marketing_consent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.marketing_consent then
    new.marketing_consent_at := now();
  else
    new.marketing_consent_at := null;
    new.marketing_consent_text := null;
    new.marketing_consent_version := null;
  end if;
  return new;
end $$;

drop trigger if exists leads_stamp_marketing_consent on public.leads;
create trigger leads_stamp_marketing_consent
  before insert or update of marketing_consent on public.leads
  for each row execute function public.stamp_marketing_consent();
