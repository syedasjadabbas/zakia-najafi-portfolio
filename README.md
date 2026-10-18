# Zakia Batool Najafi — portfolio and live lectures

A single-page site for Zakia Batool Najafi (Master's in Islamic Sciences) with paid live-lecture registration.

Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS 4, PostgreSQL.

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in ADMIN_PASSWORD and SESSION_SECRET
npm run dev                  # http://localhost:3000
```

Set `SHOW_EXAMPLE_LECTURES=true` in `.env.local` to try registration with fictional sample lectures. They are never loaded in production.

| Command | |
| --- | --- |
| `npm run dev` | development server |
| `npm run build` / `npm start` | production build and server |
| `npm test` | unit and integration tests (embedded Postgres, Stripe webhook signatures) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |

The scripts call `node node_modules/...` directly because the project folder name contains `&`, which breaks npm's Windows `.cmd` shims.

## Where content lives

All public content is in `src/content/`. Edit these files; the page hides anything left empty.

- `site.ts`: name, qualification, introduction, biography, portrait, email, social links, courses, consultation, manual payment instructions.
- `lectures.ts`: live lectures (format documented at the top of the file). Prices are in minor units (`1000` = £10.00).
- `videos.ts`: recorded lectures from the YouTube channel. The first entry is featured, using the still in `public/images/`.

Joining links are **not** stored in these files. They are entered at `/admin` and kept in the database.

## Registration and payment

Flow: choose a lecture → review details → name and email → payment → private registration page → confirmation → joining instructions.

- **Free lectures** are confirmed immediately.
- **Manual payment** (`PAYMENT_PROVIDER=manual`, the default) shows the instructions from `site.payment.manualInstructions`. The visitor submits a transaction reference, the registration becomes *pending verification*, and an administrator approves or rejects it at `/admin`. Paid registration stays switched off until instructions are filled in.
- **Stripe** (`PAYMENT_PROVIDER=stripe`) redirects to Stripe Checkout. A registration is confirmed only by the webhook at `/api/stripe/webhook` after the signature is verified, the session is paid, and amount and currency match. Each event is applied once. Abandoned checkouts expire after 30 minutes and release the place. Register the webhook in Stripe for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` and `checkout.session.expired`.

Safeguards: capacity is enforced inside a database transaction (tested with concurrent submissions); one active registration per email per lecture; a transaction reference cannot be reused; all input is validated on the server; spam is filtered by a honeypot field.

### Access to joining instructions

Each registrant gets an unguessable private link (`/registration/<token>`). Only a SHA-256 hash of the token is stored. Joining instructions appear there only once the registration is confirmed. These pages send `noindex` and `no-referrer` headers and are disallowed in `robots.txt`.

Anyone holding a registrant's private link can see that registrant's instructions, and a confirmed participant can still pass a meeting link on to someone else. **The site cannot prevent redistribution completely.** For paid lectures, also turn on the platform's own controls, for example Zoom registration with per-attendee links, a waiting room, or authenticated users only.

### Email

With `RESEND_API_KEY` and `EMAIL_FROM` set, registrants receive their private link by email, plus a notice when they are approved or rejected. Without email, the private link is shown only on screen after registering, and the page asks the visitor to keep it.

## Deployment

- Set `NEXT_PUBLIC_SITE_URL`, `DATABASE_URL`, `ADMIN_PASSWORD` and `SESSION_SECRET`. Tables are created automatically on first connection.
- A real PostgreSQL database is required in production. The embedded fallback writes to local disk, which is not persistent on serverless hosts.
- The admin sign-in is a single shared password with an 8-hour signed cookie. Failed attempts are rate-limited in memory, per server instance.

## Still needed from the client

| Item | Where it goes | Effect until supplied |
| --- | --- | --- |
| Contact email | `site.email` | No email link anywhere; contact shows social profiles only |
| Biography | `site.biography` | About shows a short factual summary |
| Approved high-resolution portrait | `public/images/` + `site.portrait` | Hero uses a 424×530 crop of the photo on her official YouTube thumbnail for the 1st Majlis, Muharram 1448 (poster designed for Al-Abbas Islamic Centre). Confirm permission or replace. |
| Payment method and instructions, or Stripe account | `site.payment.manualInstructions` or Stripe env vars | Paid lectures show "registration will open shortly" |
| Lectures (title, date/time, time zone, language, platform, fee, capacity, deadline) | `src/content/lectures.ts` | "New lecture details will be announced here." |
| Hawzah course / Tafseer class details | `site.courses` | One line saying schedules will be published |
| Consultation scope and how to request | `site.consultation.details` | One factual sentence |
| Domain | `NEXT_PUBLIC_SITE_URL` | Canonical URLs and sitemap point at localhost |
| Approved logo or monogram | `src/app/icon.tsx` | Placeholder "Z" monogram favicon |
| Privacy notice review | `src/app/privacy/page.tsx` | Plain description of what the site actually collects; not legal advice |

No publications, testimonials or statistics are shown, and none were invented. Add a publications section only when real material exists.

## Known limitations

- A lecture URL that doesn't exist streams a "Page not found" page with `noindex`, but returns HTTP 200: with partial prerendering the static shell is sent before the lookup runs.
- Revoking a confirmed Stripe registration in the admin does not issue a refund. Refund in the Stripe dashboard.
- Terms page not implemented. Add one if paid lectures need cancellation or refund terms.
