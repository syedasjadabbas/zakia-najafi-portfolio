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

- `site.ts`: name, qualification, introduction, biography, portrait, email, social links, courses, consultation.
- `lectures.ts`: live lectures (format documented at the top of the file). Prices are in minor units (`1000` = £10.00).
- `videos.ts`: recorded lectures from the YouTube channel. The first entry is featured, using the still in `public/images/`.

Joining links are **not** stored in these files. They are entered at `/admin` and kept in the database.

## Registration and payment

Flow: choose a lecture → Register → name, email, optional WhatsApp → payment region and method → gateway's secure page → private registration page → confirmation (only after verified payment) → joining instructions.

- **Free lectures** (`paid: false`) are confirmed immediately.
- **Paid lectures** (`paid: true`) show prices only on the registration page, never on the lecture cards. Fees and methods are configured once, in `src/lib/payment-options.ts`:
  - Pakistan: **PKR 500**, via JazzCash or Easypaisa.
  - International: **USD $2**, via international card payment.
- **Current state: UI only.** Every method is marked "coming soon", so "Proceed to payment" is disabled and the server refuses paid registrations with "Secure online payments will be available soon." No payment is simulated and no registration is confirmed.

### Connecting a payment gateway later

1. Implement the gateway in `src/lib/payment-gateways.ts` (`startCheckout` creates the gateway's hosted checkout and returns its URL; card details, PINs and OTPs are entered only on the gateway's page).
2. Add a server-to-server callback route, e.g. `src/app/api/payments/jazzcash/route.ts`, that verifies the gateway's signature or hash, checks amount and currency against the registration, records the event with `applyPaymentEvent` (so it is applied once) and only then moves the registration to `confirmed`. `src/app/api/stripe/webhook/route.ts` is a working example.
3. Put credentials in server environment variables (see `.env.example`).
4. Set the method's `availability` to `"live"` in `src/lib/payment-options.ts`. The method becomes selectable only when it is live **and** its gateway reports itself configured.

The international card slot is already implemented with Stripe Checkout: setting `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` and marking `card` live enables it. Register the webhook for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` and `checkout.session.expired`. Abandoned checkouts expire after 30 minutes and release the place.

Manual approval at `/admin` (approve, reject, revoke) remains available for registrations that need checking by hand.

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
| Permission for the hero photo | `public/images/portrait-muharram-1448.jpg` | The portrait from her Muharram 1448 YouTube thumbnails (poster for Al-Abbas Islamic Centre, 17 June 2026), 424×530. Confirm use, and ideally supply the original photograph at full resolution. |
| JazzCash / Easypaisa merchant accounts and an international card gateway (or Stripe) | `src/lib/payment-gateways.ts` + env vars | Paid lectures show the payment options, with "Proceed to payment" disabled and "Secure online payments will be available soon." |
| Lectures (title, date/time, time zone, language, platform, fee, capacity, deadline) | `src/content/lectures.ts` | "New lecture details will be announced here." |
| Hawzah course / Tafseer class details | `site.courses` | One line saying schedules will be published |
| Consultation scope and how to request | `site.consultation.details` | One factual sentence |
| Hero tagline (optional, e.g. the motto in the approved mock-up) | `site.heroTagline` | Not shown; no wording has been approved |
| Domain | `NEXT_PUBLIC_SITE_URL` | Canonical URLs and sitemap point at localhost |
| Privacy notice review | `src/app/privacy/page.tsx` | Plain description of what the site actually collects; not legal advice |

No publications, testimonials or statistics are shown, and none were invented. Add a publications section only when real material exists.

## Known limitations

- A lecture URL that doesn't exist streams a "Page not found" page with `noindex`, but returns HTTP 200: with partial prerendering the static shell is sent before the lookup runs.
- Revoking a confirmed Stripe registration in the admin does not issue a refund. Refund in the Stripe dashboard.
- The Terms page (`/terms`) covers only how registration works. Fees, cancellation and refund terms must be supplied and reviewed before paid lectures go live.
- Logo: the supplied ZB monogram is kept unchanged at `public/brand/zb-logo-original.webp`. `python scripts/make-logo-assets.py <original> <out-dir>` regenerates the transparent navbar and footer versions (`public/brand/zb-mark-on-*.png`) and the favicons (`src/app/icon.png`, `src/app/apple-icon.png`). Re-run it if the client sends a vector (SVG) version, which would be sharper still.
- Hero: the background `public/images/hero-arch-background.webp` was supplied by the client (an empty arch scene, no person). Her portrait `public/images/portrait-muharram-1448-cutout.png` is her real thumbnail photo with the poster background removed by `scripts/make-portrait-cutout.py` (OpenCV GrabCut, which only traces the outline and does not generate pixels). Both are positioned from the arch centre at 72.9% of the background width.
- About photo: `public/images/majlis-safar-1444-mwa.jpg` is an unedited frame from her YouTube recording of the 3rd Majlis, Safar 1444 (MWA, youtube.com/watch?v=vTXe_Vp_10U), cropped above the video's name strip.
- Registration page photo: `public/images/majlis-3-muharram-1448.jpg` is an unedited frame from her recording of the 3rd Majlis, Muharram 1448 (KSIMC Birmingham, youtube.com/watch?v=NEbP26zAs6s), cropped clear of the video's name banner.
- Courses image: `public/images/courses-books.webp` is AI-generated (Figma AI, Gemini image model) at the site owner's request: a still life of bound books, with no people and no text. Replace it with a real photograph if preferred.
- Fonts (Newsreader, IBM Plex Sans, Amiri; OFL-1.1) are self-hosted from `src/app/_fonts/` via `next/font/local`. The Google Fonts loader fails to build in a folder whose path contains `&`, and self-hosting also keeps visitors off Google.
- Brand icons in the contact section and footer come from Simple Icons v16.35.0 (CC0), stored in `src/components/brand-paths.ts`.
