# ALL IN · Meta ad lead capture

Single-page lead magnet for the Mad Monkey **ALL IN** group trips Meta ad.
Visitors trade their details for the trip guide; the lead lands in the Lovable
Cloud (Supabase) database with its ad attribution attached.

Styled to match the ALL IN site (`CFSiteDesign/mm-squad-trips`): Mad Monkey
poster palette, Montserrat 900 uppercase display, Bungee stickers, hard-offset
shadows, zero border radius.

## What it collects

`name`, `email`, `phone`, `nationality`, plus attribution captured from the ad
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
> `authenticated can read leads` policy. As written, *any* signed-in user can
> read every lead.

### Marketing consent

The form carries a required, unticked-by-default consent box for the Global
WhatsApp / SMS / email sales messaging. Four columns back it:

| Column | Meaning |
| ------ | ------- |
| `marketing_consent` | True only if the visitor actively ticked the box |
| `marketing_consent_at` | Set by a database trigger, never by the browser |
| `marketing_consent_text` | The verbatim wording that was on screen |
| `marketing_consent_version` | Which revision of that wording it was |

Storing the wording is the whole point: "they ticked a box" is not a defensible
record without proof of what the box said. The wording lives in
[`src/data/consent.ts`](src/data/consent.ts).

> **Never edit the consent text in place.** Bump `MARKETING_CONSENT_VERSION`
> when it changes, or historical rows will claim agreement to wording that was
> never shown to those people.

A trigger stamps the timestamp server-side and scrubs the text and version on
any row that does not carry consent, so a forged consent record cannot be
inserted through the public anon key.

Only export `marketing_consent = true` rows into any messaging tool. The admin
CSV includes all four columns.

### Admin

There is no `/admin` page in this repo yet. A shared Supabase Auth user
(`leads-admin@madmonkeyhostels.com`) already exists to sign in with, and the
read policy above is what it relies on. Its password is set in Supabase Auth
only and is deliberately **not** stored in this repository, because this repo is
public.

## Local development

```sh
npm install
npm run dev          # http://localhost:8080
```

Lovable Cloud injects the Supabase credentials in the editor and in deployed
builds. To point a local dev server at the real database, copy `.env.example`
to `.env` and fill it from the Lovable editor (Cloud → Settings).

### `VITE_SITE_URL`

Social scrapers can't resolve relative URLs and don't run JS, so `og:url`,
`og:image` and `<link rel="canonical">` must be absolute and baked in at build
time. `vite.config.ts` substitutes `VITE_SITE_URL` into `index.html`.

It falls back to the Lovable preview URL, which keeps builds valid but means a
shared link would show the preview domain. **Set `VITE_SITE_URL` to the real
origin (no trailing slash) once the domain is decided.**

The share card is `public/og-image.jpg`, a 1200x630 JPEG. Deliberately *not*
WebP: Meta's link scraper can't read WebP and renders no image at all.

Without credentials the form still runs end to end, but logs the lead to the
console instead of saving it, and says so.

```sh
npx tsc -p tsconfig.app.json --noEmit   # typecheck (plain `tsc` is a no-op here)
npm run build
```

## Deploying

Two steps, as with the other Lovable projects:

1. `git push` to `main` syncs the code into the Lovable workspace.
2. Hit **Publish** in the [Lovable editor](https://lovable.dev/projects/dd20555c-e6eb-4512-a003-bdd808d48925). A push alone does **not** put it live.
