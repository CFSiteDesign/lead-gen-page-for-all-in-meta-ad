# ALL IN — Meta ad lead capture

Single-page lead magnet for the Mad Monkey **ALL IN** group trips Meta ad.
Visitors trade their details for the trip guide; the lead lands in the Lovable
Cloud (Supabase) database with its ad attribution attached.

Styled to match the ALL IN site (`CFSiteDesign/mm-squad-trips`): Mad Monkey
poster palette, Montserrat 900 uppercase display, Bungee stickers, hard-offset
shadows, zero border radius.

## What it collects

`name`, `email`, `phone`, `nationality` — plus attribution captured from the ad
click: `utm_*`, `fbclid`, `referrer`, `user_agent`, and `source`
(defaults to `all-in-meta-ad`).

## Backend

Lovable Cloud is enabled on this project. Table `public.leads`, defined in
[`supabase/migrations/20260829_create_leads.sql`](supabase/migrations/20260829_create_leads.sql).

Row Level Security:

| Role            | Insert | Select |
| --------------- | ------ | ------ |
| `anon`          | ✅     | ❌     |
| `authenticated` | ✅     | ✅     |

`anon` is insert-only on purpose. The publishable key ships in a public bundle,
so an anon read policy would let anyone dump the lead list. Reading leads
requires a signed-in Supabase session.

> **Before enabling public sign-up on this project**, tighten the
> `authenticated can read leads` policy — as written, *any* signed-in user can
> read every lead.

### Admin

There is no `/admin` page in this repo yet. A shared Supabase Auth user
(`leads-admin@madmonkeyhostels.com`) already exists to sign in with, and the
read policy above is what it relies on. Its password is set in Supabase Auth
only and is deliberately **not** stored in this repository — this repo is
public.

## Local development

```sh
npm install
npm run dev          # http://localhost:8080
```

Lovable Cloud injects the Supabase credentials in the editor and in deployed
builds. To point a local dev server at the real database, copy `.env.example`
to `.env` and fill it from the Lovable editor (Cloud → Settings).

Without credentials the form still runs end to end, but logs the lead to the
console instead of saving it, and says so.

```sh
npx tsc -p tsconfig.app.json --noEmit   # typecheck (plain `tsc` is a no-op here)
npm run build
```

## Deploying

Two steps, as with the other Lovable projects:

1. `git push` to `main` — syncs the code into the Lovable workspace.
2. Hit **Publish** in the [Lovable editor](https://lovable.dev/projects/dd20555c-e6eb-4512-a003-bdd808d48925) — a push alone does **not** put it live.
