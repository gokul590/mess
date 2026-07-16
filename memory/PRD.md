# Palaniyappa Mess — PRD

## Original Problem Statement
Premium, Awwwards-quality restaurant marketing website for "Palaniyappa Mess, Pudukkottai" — authentic Chettinad / Tamil Nadu non-vegetarian cuisine. Kinetic hero, numbered manifesto chapters, editorial marquee, spotlight food photography, dark mode, framer-motion + lenis, functional reservation/contact/newsletter forms, WhatsApp ordering.

## User Personas
1. **Local diners / families in Pudukkottai** — reserve a table, browse menu, see prices, book family hall.
2. **Weekend & festival guests** — check specials, get directions, WhatsApp order.
3. **Corporate / catering enquiries** — bulk booking through WhatsApp CTA.

## Core Requirements (Static)
- Editorial premium design — Cormorant Garamond + Outfit, warm Chettinad palette.
- Sections: Hero, Marquee, Manifesto (3 chapters), Signature Menu (15 dishes), Why-Choose-Us (8 cards), Specials (3 offers), Chef Services (Catering/Hall/Party), Gallery (masonry, 12 images), Reviews (4), Reservation+Contact, FAQ + Newsletter, Footer.
- Motion: framer-motion reveals + lenis smooth scroll + parallax hero + marquee.
- Dark/light theme toggle with persistence.
- WhatsApp integration (+91 99429 33912) — hero, dishes, specials, services, FAB.
- Fully responsive with mobile drawer nav.

## Implemented (2026-01)
- FastAPI backend endpoints: POST/GET /api/reservations, /api/contact, /api/newsletter (idempotent) — all persisting to MongoDB.
- Full React/Tailwind frontend with all sections above.
- Framer-motion masked line-by-line hero reveal, scroll-triggered FadeInUp reveals, parallax bg, animated marquee.
- Lenis smooth scroll with programmatic scrollTo for nav links.
- Sonner toasts on all form submissions.
- Google Maps embed (generic Pudukkottai).
- Gallery lightbox with Radix Dialog + a11y VisuallyHidden title.
- WhatsApp floating FAB with pulse ring + back-to-top button.
- SEO title + meta description.
- data-testid on every interactive element.

## Backlog / Deferred (Future)
- **P1** Instagram feed live embed (currently social icon only)
- **P1** Admin dashboard to view reservations/contacts/newsletter
- **P2** Multi-language toggle (Tamil / English)
- **P2** Table availability real-time (calendar with slot picker)
- **P2** Online payment for weekend combos (Razorpay)
- **P2** Email confirmation on reservation (Resend)
- **P2** 3D dish spotlight (WebGL)

## Testing
- iteration_1.json: 100% pass on backend + frontend E2E. Only LOW-priority a11y warning (now fixed).

## Iteration 2 (2026-01)
- **Est. 1980** — Added to hero badge, marquee ribbon, footer copyright, and page title.
- **Admin dashboard** at `/admin` — JWT auth (email+password), seeded admin (`admin@palaniyappamess.com` / `Palaniyappa@1980`), 3 stat cards, tabbed tables for Reservations / Messages / Newsletter subs, refresh + logout.
- **Instagram Feed** — 8-tile 4-column grid section with hover-in overlay, follow CTA.
- **Loading screen** — 1.9s premium initial reveal with animated wordmark + golden progress bar.
- **Dish carousel** — Swiper.js chef's-selection carousel with 8 featured dishes (autoplay + prev/next controls), each linking to WhatsApp order.
- **Backend** — Protected list endpoints, bcrypt password hashing, X-Forwarded-For based brute-force lockout (5 attempts → 429 for 15min, verified working under K8s ingress).
- **Testing** — iteration_2.json: 100% frontend, backend brute-force initially failed under K8s (proxy IP round-robin) — fixed by using X-Forwarded-For.

## Tech Stack Note
- User asked for Next.js + TypeScript + GSAP; the Emergent platform only supports **React (CRA) + FastAPI + MongoDB**. Framer Motion + Lenis + Swiper.js cover all the animation needs GSAP would provide. No stack migration performed.

## Iteration 3 (2026-01)
- **Rate limiting** — MongoDB sliding-window IP+endpoint limiter: reservations 5/10min, contact 5/10min, newsletter 3/10min. X-Forwarded-For aware (K8s-safe).
- **Reservation email** — Background task via Emergent-managed Resend integration. Sends HTML email to ADMIN_EMAIL on new reservation. Non-blocking; logs warning + skips gracefully if EMERGENT_EMAIL_KEY unset.
- **Tamil / English toggle** — I18nProvider + translations dictionary. Toggle in header (desktop + mobile). Localstorage persistent. Hero, nav, forms, toasts translated.
- **Instagram Graph API** — GET /api/instagram fetches recent media (1h cached). Env-driven IG_ACCESS_TOKEN + IG_USER_ID. Frontend falls back to curated tiles + hides "Live" badge when API unset.

## Environment variables to activate integrations
- `EMERGENT_EMAIL_KEY` (backend .env) — provision Emergent Email via Profile → Integrations to enable reservation admin emails.
- `IG_ACCESS_TOKEN` + `IG_USER_ID` (backend .env) — Instagram Business Account long-lived token from developers.facebook.com to enable live IG feed.

## Testing
- iteration_3.json — 10/10 backend pytest pass, frontend UI + i18n verified.

## Iteration 4 (2026-01)
- **Twilio SMS + WhatsApp** — Background task on new reservation sending both SMS and WhatsApp to owner (+91 99429 33912). Env-driven; graceful skip when unset. Playbook noted the OTP pattern; we use direct messages.create API for send-only.
- **Reservation status workflow** — status field with 4 states (pending / confirmed / seated / cancelled). PATCH /api/reservations/{id}/status admin endpoint. Frontend StatusControl with pill buttons on each reservation card, updates in-place with toast.
- **Menu CMS** — /api/dishes now backed by MongoDB (seeded from static data on startup). GET/PATCH /api/admin/dishes. Editor UI with per-field inputs, save-when-dirty button, active toggle. Public Signature section fetches from API with static fallback.
- **Specials CMS** — Same pattern for /api/specials.
- **Testing** — iteration_4.json: 16/16 backend pytest pass, all frontend flows verified.

## Iteration 4b (2026-01)
- **VideoStory section** — Embedded YouTube video (id: MgAp2MIWDKA) between Reviews and Contact. Editorial layout with golden play button overlay on high-res thumbnail; click opens autoplay modal with iframe. Animated with framer-motion.

## Env vars to activate all integrations
- `EMERGENT_EMAIL_KEY` → admin email on reservation
- `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_FROM_SMS` (E.164) + `TWILIO_FROM_WHATSAPP` (whatsapp:+X) + `OWNER_PHONE` → SMS/WhatsApp on reservation
- `IG_ACCESS_TOKEN` + `IG_USER_ID` → live Instagram feed
