# PrathibaLanka - frontend

React front end for the PrathibaLanka travel agency backend. Vite, React Router, plain CSS - no UI
framework, so the palette and layout stay easy to change.

## Pages

| Route | Contents |
|---|---|
| `/` | Hero carousel, trust badges, philosophy, signature journeys, sustainability, gallery, journal, reviews, FAQ, CTA band |
| `/journeys` | Full catalogue with destination search (`GET /api/packages`, `GET /api/packages/search`); deep links like `/journeys?destination=yala` |
| `/journeys/:id` | One journey: overview, day-by-day itinerary, gallery strip, reviews for that package, sticky quote card |
| `/journal` | Featured story plus the rest of the published posts |
| `/journal/:id` | Full story, then more from the journal |
| `/gallery` | Large mosaic of live gallery images, or the illustrated placeholders while it is empty |
| `/reviews` | Average score, rating distribution and every review |
| `/about` | Our story, the four things we hold to, milestones timeline |
| `/contact` | Phone/email/office cards, the enquiry form, a link to the PIN tracker |
| `/plan` | **Plan your journey**: enquiry form (`POST /api/contact`), PIN tracker (`GET /api/bookings/track`), how-it-works steps |
| `*` | 404 |

Planning and booking-tracking live only on `/plan`; every "Plan your trip" / "Request" button routes
there. The header link `/plan#track` lands with the cursor already in the PIN field.

Every page works without the backend: detail routes fall back to the matching sample record and the
lists fall back to `src/data/fallback.js`, with a notice explaining which one you are seeing.

## Requirements

- Node 20.19+ or 22.12+ (developed on Node 24)
- The backend on `http://localhost:8080` for live data (optional - see Fallbacks)

## Run

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

The backend whitelists `http://localhost:5173` in CORS, so no proxy is needed. Point the front end
elsewhere with an env file:

```bash
# .env.local
VITE_API_BASE_URL=https://api.example.com
```

## Checks

```bash
npm run build         # production build -> dist/
npm run preview       # serve the build on http://localhost:4173
npm run check:render  # renders /, /plan and the 404 route in Node and asserts their content
```

`check:render` is the useful one: it fails on undefined components or broken props, and it enforces
that the planning/tracking panels have not leaked back onto the home page.

## API usage

| Where | Endpoint |
|---|---|
| Signature journeys, `/journeys`, detail page | `GET /api/packages`, `GET /api/packages/{id}`, `GET /api/packages/search?destination=` |
| Gallery (home + `/gallery`) | `GET /api/gallery`, `GET /api/gallery/package/{id}` |
| Journal (home + `/journal`) | `GET /api/journal/published`, `GET /api/journal/published/{id}` |
| Reviews (home + `/reviews` + detail) | `GET /api/reviews`, `GET /api/reviews/package/{id}` |
| Enquiry form (`/plan`, `/contact`) | `POST /api/contact` - public |
| PIN tracker (`/plan`) | `GET /api/bookings/track?pin=` - public |

**Fallbacks.** If the backend is down or a table is empty, `src/data/fallback.js` is rendered instead
and a small notice explains why, so no page ever looks broken. Booking and review *submission* are
not wired up here: those endpoints need a customer token and belong to the account area, which is
the next page to build.

## Design system

`src/styles/theme.css` holds every token. The palette is deep ink + metallic gold with the logo's
emerald as a secondary note:

- `--ink-950 … --ink-500` page and section backgrounds
- `--gold-500` (CTA and accents), `--gold-300` (on dark), `--gold-700` (text on light)
- `--ivory-50/100` light surfaces, `--sand-*` warm grey text
- `--emerald-600` brand note, plus `--success/--warning/--error/--info`

Contrast: gold is 7.56:1 on ink and 7.29:1 with ink text on it, but only 2.48:1 as text on ivory -
so gold text is never placed on light backgrounds (buttons use ink text on gold). Change the palette
in this one file and the whole site follows.

**Motion.** `--dur*` and `--ease-out-soft` in the same file drive every transition. On top of that:
a scroll-progress bar, `<Reveal>` (IntersectionObserver fade/lift with stagger), a slow drift on the
active hero slide, hover zooms on card imagery, a gold sweep on CTA buttons, and animated nav
underlines. Everything collapses under `prefers-reduced-motion: reduce`.

## Continuous integration

`.github/workflows/ci.yml`:

| Job | When | What |
|---|---|---|
| `Build & render check` | PRs into `main`, pushes to `main`/`user-updates` | `npm ci`, `npm run build`, `npm run check:render`, uploads `dist` |
| `Deploy to GitHub Pages` | push to `main`, opt-in | builds with the Pages base path and publishes |

The deploy job only runs when the repository variable `DEPLOY_PAGES` is `true` and Pages is enabled
(Settings → Pages → Source: GitHub Actions). Until then it is skipped, so the pipeline cannot fail
because of it.

## Structure

```
src/
  api/client.js            fetch wrapper (base URL, timeouts, typed errors) + every endpoint used
  hooks/useApi.js          list loader with loading / live / fallback states
  hooks/useResource.js     single-record loader (loading / ready / missing / error)
  utils/format.js          price, date and paragraph helpers
  data/fallback.js         sample journeys, journal posts, reviews, FAQ copy
  styles/theme.css         design tokens
  styles/base.css          reset, type, buttons, grid, reveal/motion utilities
  styles/components.css    section and page styles
  components/layout/       Header, Footer, PageHero, SplashIntro
  components/plan/         EnquiryForm, TrackBooking  (used by /plan and /contact)
  components/sections/     Home page sections
  components/ui/           Icons, Scenery, PackageCard, Reveal, ScrollProgress
  pages/                   Home, Journeys, JourneyDetail, JournalPage, JournalDetail,
                           GalleryPage, ReviewsPage, About, Contact, PlanPage, NotFound
```

## Images

No external image dependencies: scenes are drawn as SVG by `components/ui/Scenery.jsx` (temple,
safari, tea, coast, train, hills). Drop photography into `public/images/` and swap a `<Scenery />`
for an `<img />` when you have it - the gallery already renders live `imageUrl` values from the API.

## Not built yet

Package detail pages, the booking flow (customer login → request), the admin dashboard, and forms
for reviews/contact beyond the enquiry form.
