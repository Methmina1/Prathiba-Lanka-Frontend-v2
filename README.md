# PrathibaLanka - frontend

React front end for the PrathibaLanka travel agency backend. Vite, React Router, plain CSS - no UI
framework, so the palette and layout stay easy to change.

## Pages

| Route | Contents |
|---|---|
| `/` | Hero carousel, trust badges, philosophy, signature journeys (two rows of three, then a link to the full catalogue), the province map, sustainability, gallery, journal, reviews, FAQ, CTA band |
| `/journeys` | Full catalogue with destination search (`GET /api/packages`, `GET /api/packages/search`); deep links like `/journeys?destination=yala`; each card opens the full write-up in a dialog |
| `/journeys/:id` | One journey: overview, the full description, day-by-day itinerary, gallery strip, reviews for that package, sticky quote card |
| `/journal` | Featured story plus the rest of the published posts |
| `/journal/:id` | Full story, then more from the journal |
| `/gallery` | Large mosaic of live gallery images, or the illustrated placeholders while it is empty |
| `/reviews` | Average score, rating distribution and every review |
| `/about` | Our story, the four things we hold to, milestones timeline |
| `/contact` | Phone/email/office cards, the enquiry form, a link to the PIN tracker |
| `/plan` | **Plan your journey**: enquiry form (`POST /api/contact`), PIN tracker (`GET /api/bookings/track`), how-it-works steps |
| `/login`, `/register` | Customer sign in and sign up (`POST /api/auth/login`, `POST /api/auth/register`); the JWT is kept in localStorage |
| `/account` | Signed-in customers: their bookings (`GET /api/customer/bookings`), a new booking request (`POST /api/bookings/request`) and a review form (`POST /api/reviews`) |
| `/admin` | **Staff console.** Overview: pending/confirmed counts, live packages, new enquiries, recent bookings |
| `/admin/bookings` | Every booking with status filter, confirm (price + date) and reject |
| `/admin/queries` | Enquiries with a "new only" filter and a reply box that emails the sender |
| `/admin/packages` | Journey CRUD, activate/deactivate, delete |
| `/admin/journal` | Story CRUD, publish/unpublish, delete |
| `/admin/gallery` | Images and short clips on the public gallery, linked to a journey if you like |
| `/admin/media` | **Media library**: upload images and short videos, see the path each is served from, delete |
| `/admin/content` | **About and Contact pages**: every heading, paragraph, list entry and contact card, including the footer details |
| `/admin/reviews` | Moderation: read every review, remove one from the public page |
| `*` | 404 |

Planning and booking-tracking live only on `/plan`; every "Plan your trip" / "Request" button routes
there. The header link `/plan#track` lands with the cursor already in the PIN field.

Every page works without the backend: detail routes fall back to the matching sample record and the
lists fall back to `src/data/fallback.js`, with a notice explaining which one you are seeing.

## Who signs in

`/login` is for two different people, decided by the role the backend returns in the JWT:

| Role | Sees | Cannot |
|---|---|---|
| `ROLE_CUSTOMER` | `/account` - own bookings, new booking request, review form | reach `/admin` |
| `ROLE_ADMIN` | `/admin` - the staff console | book a trip or post a review |

**The header never says who is signed in.** It shows a *User* icon with *Account* (or *Console* for
staff) and a *Sign out* button - no name, no address, because the bar is on every public page and
whose account it is is nobody else's business. Signing out clears the session, drops the console or
account link, and puts the visitor back on the home page; the account and console pages need a
session, so staying on one would only bounce them to the login form. Below the drawer's breakpoint
the account and its sign-out live in the drawer instead, where there is room to spell them out.
The token itself stays valid until it expires (24h by default) - logging out ends the session in this
browser rather than revoking the JWT, which is what a stateless token means.

An administrator is staff, so the booking flow is closed to them twice over: the backend refuses
`/api/bookings/request`, `/api/customer/bookings` and `POST /api/reviews` with a 403 for an admin
token (`@PreAuthorize("hasRole('CUSTOMER')")` on the controllers), and the site does not offer the
flow at all - no *Plan your trip* in the header, no *Plan your journey* in the footer, no *Request*
on a journey card or page, and `/plan` explains instead of showing the forms. That decision lives in
one place, `mayBook` in `auth/AuthContext.jsx`, so a new call to action cannot quietly reintroduce
it.

The admin console is reached from the small **Admin sign in** link in the site footer. There is no
self-service admin signup: the account comes from `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD`
in the backend.

`/admin/**` is guarded on the client too - `components/admin/AdminLayout.jsx` sends a signed-out
visitor to `/login?next=<path>` and shows "Admin access required" for a customer session - but the
real enforcement is `SecurityConfig`: every `/api/admin/**` call needs `ROLE_ADMIN`, so a customer
token gets 403 whatever the UI does.

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
npm run check:render  # renders all 24 routes in Node and asserts their content
npm run test:e2e      # drives the built site in Chromium against a mocked API (Playwright)
npm run test:roles    # drives the real site against a real backend, as each role
npm run seed          # load the demo content into a running backend (optional)
npm run extract:packages   # rate sheet (.xlsx) -> packages.json
npm run import:packages    # packages.json -> a running backend (see "The package catalogue")
```

Five suites cover the project between them, from the outside in:

| Suite | Needs | Covers |
|---|---|---|
| `scripts/api-tests.ps1` (backend repo) | a running API | every endpoint over HTTP - 160 checks |
| `mvn test` (backend repo) | nothing | the Spring context, the mail configuration |
| `npm run check:render` | nothing | all 24 routes in Node: undefined components, bad hooks, broken props |
| `npm run test:e2e` | nothing (API mocked) | 30 browser tests: layout, clicks, navigation |
| `npm run test:roles` | a running API + `BOOTSTRAP_ADMIN_PASSWORD` | 21 end-to-end journeys through the real UI and the real database, one per role |

`check:render` is the useful one: it renders every page (14 public, 8 screens under `/admin` with a
stubbed admin session) with `renderToString`, so an undefined component, a bad hook or a broken prop
fails the build without a browser. It also checks the two access rules - a customer session on
`/admin` must show "Admin access required" and a signed-out one must render no console at all -
asserts that the photographs the site ships with are still referenced by the pages that use them, and
enforces that the planning/tracking panels have not leaked back onto the home page.

### The live role suite

`npm run test:roles` is the one that answers "does the whole thing actually work?". It drives the
dev server with a real backend behind it, walking the site as the three people who use it:

| Role | What it does |
|---|---|
| a visitor | reads every public page, searches the catalogue, opens a journey and a story, sends an enquiry, tracks an unknown PIN, registers an account, is kept out of `/account` and `/admin` |
| a customer | signs in, requests a journey and gets a PIN, tracks it, leaves a review, finds it on the public reviews page, is refused the console, signs out |
| a member of staff | signs in to the dashboard, **confirms the customer's booking** (which the customer then sees, with the agreed price), answers the visitor's enquiry, creates/edits/deactivates a package, writes/publishes/unpublishes/deletes a story, uploads a file and puts it in the gallery, edits the contact page and sees it on the public site, removes the customer's review, is refused the booking flow by the API, signs out |

It writes to the database it points at, so every record it creates carries a run marker (`E2E<id>`,
generated once per run by `scripts/live-roles.mjs` and handed to every worker through the
environment) and is deleted again at the end of the run - the cleanup prints what it removed, and
`PRATHIBALANKA_SKIP_CLEANUP=1` keeps everything for inspection. Workers are restarted after a
failure, which is why nothing is remembered in memory between tests: each one looks its data up by
the marker, so a single step can also be re-run on its own:

```bash
npm run test:roles -- -g "confirms the booking"
```

`test:e2e` covers what a Node render cannot: real geometry, clicks and navigation. It builds the app,
serves it with `vite preview`, and drives it with Chromium against a mocked API (`tests/e2e/fixtures.js`),
so it needs no backend. Thirty tests across three files:

| File | Covers |
|---|---|
| `public.spec.js` | the hero carousel and its four photographs (including that each image actually loads), the sign-in link being absent from the header and present on `/plan`, journey/journal/gallery covers, a journey detail page and its day-by-day steps (one numbered step per itinerary line), the home page's two rows of three and its link to the rest, the province map (nine shapes that tile the island at Sri Lanka's proportions, choosing one, and holding one so the pointer can leave it), the full-description dialog (paragraphs, frozen page behind it, Escape), the About and 404 photography |
| `admin.spec.js` | both access rules, all nine console screens, the dashboard stat cards not overlapping, list contents, the status filter refetching, the sidebar, the page-content editor's two sections |
| `mobile.spec.js` | the phone header, the drawer, the hero with no sideways scroll, the console stacked with its own drawer |

The dashboard test exists because the console shipped with a layout bug that a Node render cannot see:
the stat cards' label, figure and breakdown are spans, and with no layout on the card they sat on one
line and overlapped. The suite also caught the content editor blanking the screen when switching
sections, which is fixed.

## API usage

| Where | Endpoint |
|---|---|
| Signature journeys, `/journeys`, detail page | `GET /api/packages`, `GET /api/packages/{id}`, `GET /api/packages/search?destination=` |
| Gallery (home + `/gallery`) | `GET /api/gallery`, `GET /api/gallery/package/{id}` |
| Journal (home + `/journal`) | `GET /api/journal/published`, `GET /api/journal/published/{id}` |
| Reviews (home + `/reviews` + detail) | `GET /api/reviews`, `GET /api/reviews/package/{id}` |
| Enquiry form (`/plan`, `/contact`) | `POST /api/contact` - public |
| PIN tracker (`/plan`) | `GET /api/bookings/track?pin=` - public |
| Sign in / sign up | `POST /api/auth/login`, `POST /api/auth/register` |
| `/account` | `GET /api/customer/bookings`, `POST /api/bookings/request`, `POST /api/reviews` - all send the bearer token |
| `/admin` | `GET /api/admin/bookings`, `GET /api/admin/packages`, `GET /api/admin/queries`, `GET /api/reviews` |
| `/admin/bookings` | `GET /api/admin/bookings?status=`, `PATCH /api/admin/bookings/{id}/confirm`, `PATCH /api/admin/bookings/{id}/reject` |
| `/admin/queries` | `GET /api/admin/queries?onlyNew=true`, `PATCH /api/admin/queries/{id}/respond` |
| `/admin/packages` | `GET|POST /api/admin/packages`, `PUT /api/admin/packages/{id}`, `PATCH .../deactivate`, `DELETE /api/admin/packages/{id}` |
| `/admin/journal` | `GET|POST /api/admin/journal`, `PUT /api/admin/journal/{id}`, `PATCH .../publish`, `PATCH .../unpublish`, `DELETE /api/admin/journal/{id}` |
| `/admin/gallery` | `POST /api/admin/gallery`, `PUT /api/admin/gallery/{id}`, `DELETE /api/admin/gallery/{id}` |
| `/admin/media` | `GET|POST /api/admin/media` (multipart), `GET /api/admin/media/limits`, `DELETE /api/admin/media/{id}` |
| `/admin/content` | `GET /api/admin/content`, `PUT /api/admin/content/{section}` |
| `/admin/reviews` | `DELETE /api/admin/reviews/{id}` |
| About + Contact pages, footer | `GET /api/content/about`, `GET /api/content/contact` - public; the page falls back to `src/data/pageContent.js` if the API is silent |

Every admin call goes through `src/api/admin.js`, which attaches the bearer token; the client never
caches lists, so each mutation reloads the table it changed.

**Uploads.** `src/components/admin/MediaPicker.jsx` is the shared "choose a file" dialog: it uploads
through `POST /api/admin/media` and hands the picked asset back as `{ url, mediaType }`. Stored files
are relative paths (`/media/<name>`), so `api.mediaUrl(path)` in `src/api/client.js` prefixes the API
origin before anything is rendered - without it an `<img src="/media/...">` would resolve against the
front-end origin and 404. Photographs that ship with the site (`/images/sl/...`) are already
resolvable and are returned untouched by the same helper.

**Seeding.** `npm run seed` loads the demo content into a running backend *through the admin API* -
every photograph is uploaded to the media library and every journal post and gallery item is created
the way a member of staff would create it, so all of it stays editable in the console. It is safe to
re-run (journal posts are matched on title, gallery items on their file), and it takes an optional
base URL: `npm run seed -- http://localhost:8080`. Journeys are not seeded from here - the catalogue
is the agency's own, and it is loaded from the rate sheet (below).

## The province map

Under the journeys on the home page, the nine provinces are drawn in their real positions, so the
outline they make is Sri Lanka. Pointing at a province (or picking it from the list) names it, gives
its capital, its districts and a line about what is there.

The geometry is generated, never hand-written - a map is a factual claim, and a province drawn in
the wrong place is worse than no map at all:

```bash
node scripts/build-province-map.mjs
```

`scripts/build-province-map.mjs` writes `src/data/provinces.js`. It reads the silhouettes supplied in
`public/map` **only if they really are the province each file is named after**: every supplied file
and every reference province is rasterised in a browser and scored by intersection over union, and a
file has to reach 0.80 against its namesake to be used. If all nine pass, the map is drawn from
`public/map`; if any fails, all nine come from the reference geometry instead, so the map is at least
consistent and correct. The script prints the scores, so the check is visible on every run rather
than hidden inside it.

The reference is [@svg-maps/sri-lanka](https://www.npmjs.com/package/@svg-maps/sri-lanka): 25
districts, CC BY 4.0, originally from [MapSVG](https://mapsvg.com/maps/sri-lanka). Districts are
grouped into the nine provinces, and each province's districts are joined into one path - which has
to be done carefully, because `m 44.4,578.9 2.6,0.07` is an absolute moveto followed by a *relative*
lineto, so a joined path needs the moveto rewritten rather than its letter upper-cased.

> **Attribution.** CC BY 4.0 asks for credit wherever the work is shown, and the map used to carry a
> line saying so under the panel. That line has since been removed, at the client's request, so the
> site currently shows no credit. The licence has not changed: this file and the header of the
> generated `src/data/provinces.js` still record where the geometry came from, which is the right
> thing to do but is not the same as crediting it in the product. Two ways to square it, if it
> matters: put a one-line credit back (a `.island__credit` paragraph under the panel, or the small
> print in the footer), or rebuild the map from a public-domain source - Natural Earth's admin-1
> boundaries are public domain and carry no attribution condition - and change `REFERENCE_URL` in
> the script.

The map data is 58 KB of path coordinates in the bundle. It is worth it: the alternative is a
picture of a map that cannot follow the palette, cannot be pointed at, and cannot be corrected.

**What each province is like.** `src/data/provinceCopy.js` holds a description per province, written
for somebody who has never been to Sri Lanka: what the place feels like, what you would do there, and
the season that suits it (the whale season at Mirissa, the elephant gathering on the Minneriya tank,
the east coast being the answer to the south-west monsoon). It lives outside `src/data/provinces.js`
on purpose - that file is generated, and re-running the map script must not wipe the words.

**Holding a province.** Hovering alone is not enough on this map: a province in the middle of the
island is almost impossible to read, because every route to the panel on the right passes over its
neighbours. So a click **holds** the province - the pointer can cross the rest of the map, or leave
it entirely, and the panel stays put - and a second click on the same province lets go and hands the
map back to the pointer. The panel carries a Hold/Held button that does the same thing, and `Held`
on the map's `data-held` attribute is what the browser test asserts against.

**Which journeys go through a province?** `src/data/provincePlaces.js` answers that from the places
each journey names - its title, its region, its summary and every line of its day-by-day itinerary -
so the panel stays right as packages are added or edited in the console, with no extra field to fill
in. Journeys are ranked by how much of the trip is in that province (`3 of 7 days here`), so the tour
that is mostly about a place comes above the one that merely passes through it, and the panel lists
three with a link to the rest. Every entry is a link into the catalogue.

The patterns have to be specific, and the near-misses are the interesting part:

- **Galle** is Southern, **Galle Face** is in Colombo - so the Southern pattern looks ahead and
  excludes it, or every tour that starts in the capital would claim the south coast.
- **Little Adam's Peak** is in Ella (Uva); **Adam's Peak** (Sri Pada) is 100 km away in Sabaragamuwa.
  One keyword would have merged them, so that pattern carries an `unless`.

## The package catalogue

The journeys on the site are the agency's real ones, and they come from the rate workbook - one
overview sheet plus one sheet per package, each with the day-by-day itinerary, the hotel table and
the base price. Two commands turn it into records, both of which talk to the backend through the same
admin API the console uses, so everything they write stays editable in Admin → Packages:

```bash
npm run extract:packages -- -Workbook "..\SriLanka_TourPackages.xlsx" -Out packages.json
npm run import:packages -- packages.json --prune
```

`extract:packages` is a PowerShell script (`scripts/extract-tour-packages.ps1`) that unzips the
workbook and reads the sheets directly, so it needs no Excel and no extra dependency. The package
sheets win wherever they disagree with the overview - they are the ones carrying the itinerary and the
hotels - and the overview is only used for the accommodation tier. `import:packages` matches on title,
so re-running it updates what is already there instead of duplicating it; `--prune` deletes the
packages the sheet no longer lists (unlinking their gallery photographs first, since the backend
refuses to delete a journey the gallery still points at).

| Rate sheet | Package record |
|---|---|
| package name | `title` |
| Experience (`Cultural & Heritage`, …) | `destination` - the pill on the card and the eyebrow on the detail page |
| Days | `durationDays`, and one numbered step per itinerary line |
| Base price | `price` |
| Day-by-day rows | `itinerary`, one line per day |
| Locations row, day rows, hotel table, accommodation tier | the description, in full, when the copy file has nothing for that package |

### Written copy

The words on the cards are not the sheet's words. `data/package-copy.json` holds, for each journey:

| Field | Where it appears |
|---|---|
| `summary` | the card on the home and journeys pages, and the lede at the top of the journey page - two lines, no more |
| `story` | the popup behind **Read the full description** on the journeys page, and the "About this journey" section of the journey page. Three or four paragraphs, separated by a blank line |
| `cover` | a file in `public/images/sl`, uploaded to the media library on the first import and linked as the journey's cover |

The importer merges that with the sheet: facts (route, durations, prices, hotels, day-by-day steps)
come from the workbook, prose comes from the copy file, and a package the copy file does not mention
keeps a generated description made from the sheet's own facts and gets no long one. The copy is
written for the site rather than lifted from any source document, and it is editable in
Admin → Packages → *Full description* afterwards like every other field.

Note on the numbers: the two price columns in the workbook disagree (the overview lists 550-2100 for
the 13 tours, each package sheet lists 650-6500). The importer uses the package sheet, and prints the
overview figure it did not use, so the difference is visible on every run rather than silent.

**Covers.** Each of the thirteen journeys has a photograph, chosen from the picture library for the
part of the island that journey is about (the leopard for the Yala-heavy tours, the tea estates for
the hill-country ones, the fort and the dancer for the heritage ones). They are ordinary media
library entries, so swapping one is a two-click job in Admin → Packages.

**Fallbacks.** If the backend is down or a table is empty, `src/data/fallback.js` is rendered instead
and a small notice explains why, so no page ever looks broken. The account area has no fallback - it
needs a real session - so `/account` sends signed-out visitors to `/login?next=/account`.

**Reviews are the exception.** There is no sample review in the fallbacks, and the home strip and
`/reviews` show an empty state until real ones arrive. A review is a claim that a named person
travelled with the agency and said something about it; writing those, even behind a "sample" notice,
is not ours to do. The browser tests still serve one from their mocked API (`tests/e2e/fixtures.js`,
which never ships) so the review cards themselves stay covered.

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

**Admin console.** `src/styles/admin.css` is a separate, deliberately corporate theme - a navy
`#0f1f3d` sidebar, `#1d4ed8` primary actions, `#f4f6f9` canvas and white cards - and everything it
defines is scoped under `.admin`, so the marketing palette and the staff palette cannot leak into
each other. Body text is 16.4:1 and white-on-primary 6.4:1.

**Motion.** `--dur*` and `--ease-out-soft` in the same file drive every transition. On top of that:
a scroll-progress bar, `<Reveal>` (IntersectionObserver fade/lift with stagger), a slow drift on the
active hero slide, hover zooms on card imagery, a gold sweep on CTA buttons, and animated nav
underlines. Everything collapses under `prefers-reduced-motion: reduce`.

## Deployment

The front end ships as an nginx image that serves the built bundle **and** proxies `/api` and
`/media` to the backend:

```bash
docker build -t prathibalanka-web .
docker run -p 8080:80 -e BACKEND_URL=http://host.docker.internal:8080 prathibalanka-web
```

`VITE_API_BASE_URL` is baked in at build time and is `/` in the image, which makes every request
same-origin: the browser only ever talks to this origin, so there is no CORS to configure and no
mixed-content risk, and the backend's address can change without rebuilding the bundle.

| Setting | When | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | build (`--build-arg`) | API base. `/` — the image default — means same-origin through the proxy |
| `BACKEND_URL` | runtime | Where nginx forwards `/api` and `/media`. Defaults to `http://backend.railway.internal:8080` |
| `PORT` | runtime | Port nginx listens on. Railway injects it; 80 otherwise |

### Railway

Two services from two repositories — this one and the API:

1. *New → GitHub repo → this repository*. Railway builds the `Dockerfile`; `railway.json` sets the
   builder, the `/healthz` health check and the restart policy.
2. Add a public domain (*Settings → Networking → Generate Domain*). That is the address the agency
   uses; the API needs no public domain of its own.
3. Set `BACKEND_URL` to the API service, one of:
   - `http://<api-service>.railway.internal:8080` — private networking inside the project, no egress;
   - `https://<api-service>.up.railway.app` — if the API has (or gets) a public domain.

   The default assumes that service is called `backend`, and the port has to be the one the API
   listens on. nginx resolves this at start-up, so if the API's address changes, restart this
   service.

`nginx/default.conf.template` is rendered on every container start (`${PORT}`, `${BACKEND_URL}`), so
the image never needs rebuilding when the backend moves. `nginx/05-check-backend-url.envsh` is sourced
before that rendering: it fails with an explanation rather than an nginx stack trace when
`BACKEND_URL` is missing or empty, strips a trailing slash from it, and prints the address it will
use. It is an `.envsh` because the nginx entrypoint *sources* those (so its changes reach `envsubst`)
and ignores a script that is not executable — which is why the Dockerfile chmods it.

The rest of the config is the set of decisions that make the built site behave: gzip; security
headers; `client_max_body_size 70m`, which has to stay at or above the backend's multipart limit or
an upload is rejected with a 413; a one-year immutable cache for Vite's hashed `/assets/*`;
`no-store` for `index.html`, so a deploy cannot leave a browser requesting the previous build's
assets; a 30-day cache for `/media/*`, whose filenames are per-upload UUIDs; and the SPA fallback,
so `/journeys` and `/admin/...` reach the app instead of 404ing.

## Continuous integration

`.github/workflows/ci.yml`:

| Job | When | What |
|---|---|---|
| `Build & render check` | PRs into `main`, pushes to `main`/`user-updates` | `npm ci`, `npm run build`, `npm run check:render`, uploads `dist` |
| `Browser tests (Playwright)` | same | installs Chromium and runs `npm run test:e2e` (30 tests, API mocked); uploads the report on failure |
| `Docker image serves the site` | same | builds the nginx image, starts it, and checks `/healthz`, the SPA fallback for a deep link, a hashed asset, and that an empty `BACKEND_URL` stops it with an explanation |
| `Deploy to GitHub Pages` | push to `main`, opt-in | builds with the Pages base path and publishes |

The deploy job only runs when the repository variable `DEPLOY_PAGES` is `true` and Pages is enabled
(Settings → Pages → Source: GitHub Actions). Until then it is skipped, so the pipeline cannot fail
because of it.

## Structure

```
src/
  api/client.js            fetch wrapper (base URL, timeouts, typed errors) + every public endpoint
  api/admin.js             every /api/admin/** call the console makes
  hooks/useApi.js          list loader with loading / live / fallback states
  hooks/useResource.js     single-record loader (loading / ready / missing / error)
  utils/format.js          price, date, paragraph and line helpers
  data/fallback.js         sample journeys, journal posts, FAQ copy (no sample reviews - see below)
  data/pageContent.js      default copy for the editable About/Contact pages
  data/photos.js           the photographs that ship with the site, by slot
  data/package-copy.json   the written summary, full description and cover for each journey
  data/provinces.js        the nine province shapes, placed on the island (generated)
  data/provinceCopy.js     what to say about each province, for the map panel
  data/provincePlaces.js   which places belong to which province, for the map's journey list
  auth/AuthContext.jsx     session (JWT in localStorage), login/register/logout
  hooks/usePageContent.js  loads an editable page section and merges it over the defaults
  styles/theme.css         design tokens
  styles/base.css          reset, type, buttons, grid, reveal/motion utilities
  styles/components.css    section and page styles
  styles/admin.css         staff console theme (scoped to .admin)
  components/layout/       Header, Footer, PageHero, SplashIntro
  components/plan/         EnquiryForm, TrackBooking  (used by /plan and /contact)
  components/admin/        AdminLayout (role guard + sidebar), AdminUI (table, dialog, pills),
                           MediaPicker, useAdmin
  components/sections/     Home page sections (including ProvinceMap)
  components/ui/           Icons, Scenery, PackageCard, StoryDialog, Reveal, ScrollProgress,
                           MediaFigure, CoverImage
  pages/                   Home, Journeys, JourneyDetail, JournalPage, JournalDetail,
                           GalleryPage, ReviewsPage, About, Contact, PlanPage, Login, Register,
                           Account, NotFound
  pages/admin/             Overview, Bookings, Queries, Packages, Journal, Gallery, Media, Content,
                           Reviews
scripts/
  render-check.jsx         renders every route and asserts its content
  seed-demo-content.jsx    loads the demo content through the admin API
  extract-tour-packages.ps1  rate workbook (.xlsx) -> packages.json, no Excel needed
  import-tour-packages.jsx   packages.json -> packages through the admin API
  build-province-map.mjs   public/map + reference districts -> src/data/provinces.js
  live-roles.mjs           runs the live role suite with one run id for the whole run
  optimize-images.ps1      full-resolution photographs -> web-sized JPEGs
tests/e2e/
  fixtures.js              mocked API + session seeding
  public.spec.js           hero, home layout, story dialog, journey page, covers
  admin.spec.js            access rules, all nine screens, dashboard layout
  mobile.spec.js           phone header, drawer, no sideways scroll
tests/live/
  roles.spec.js            the real UI against a real backend, per role (npm run test:roles)

# repository root
Dockerfile                 production image: vite build, then nginx serving dist/
nginx/                     the server config, rendered at start-up (see Deployment)
railway.json               builder, health check and restart policy for the Railway service
public/                    served as-is: logo, photographs, province map images, robots.txt
images-originals/          full-resolution source photographs - never published (see Photographs)
```

## Photographs

The site carries its own photographs in `public/images/sl`, and everything that is content-managed
carries an uploaded one instead. Which is which:

| Where | Comes from | Changed by |
|---|---|---|
| Home hero carousel, page header bands, the "fewer places" panel, the CTA band, the contact map panel, the 404 page | `public/images/sl/*.jpg`, mapped slot by slot in `src/data/photos.js` | replacing the file, or editing that map (a developer change) |
| Journey cards and journey headers | the package's `imageUrl`, seeded per journey by `npm run import:packages` from `data/package-copy.json` | Admin → Packages → Cover image (media library) |
| Journal cards, featured story, story cover | the post's `coverImageUrl` | Admin → Journal → Cover image (media library) |
| Gallery, home gallery strip | gallery items (image or short video) | Admin → Gallery, files from Admin → Media library |
| About and Contact header bands and the About story panel | `hero.image` / `story.image` in the page content | Admin → About and Contact (media library) |
| Journey page "from the road" strip | gallery items linked to that journey | Admin → Gallery → link to a package |

Nothing is decorative filler: every managed slot falls back to a photograph that ships with the site
(`components/ui/CoverImage.jsx`, `src/data/photos.js`) when no upload has been chosen, and to the drawn
scenes in `components/ui/Scenery.jsx` when there is no photograph at all.

**The originals.** `images-originals/Sri lanka` holds the full-resolution photographs the site was
built from (1-13 MB each - the media endpoint would refuse anything over 10 MB anyway). It is at the
repository root, **not** under `public/`, and that distinction is the whole point: Vite copies
everything in `public/` into the build verbatim, so an originals folder left there would be published
at a guessable URL, would add 330 MB to every deploy and to the nginx image, and would ship camera
EXIF the web-sized copies deliberately drop. Nothing is served from it:
`scripts/optimize-images.ps1` turns them into web-sized copies, which is where everything in
`public/images/sl` came from. `public/images/sl/SOURCES.txt` lists which original each slot was
exported from, so a photo can be traced back, re-exported at another size, or credited.

```bash
powershell -ExecutionPolicy Bypass -File scripts/optimize-images.ps1 `
    -Source "images-originals/Sri lanka" -Destination ".image-work"
```

That writes `<name>-lg.jpg` (1920px, quality 82 - headers and covers) and `<name>-sm.jpg` (900px,
quality 78 - tiles and cards) per photo, applies the EXIF orientation to the pixels and drops the rest
of the metadata, so no camera GPS data ships with the site.

## Not built yet

Password reset and profile editing. Payment is out of scope by design - a booking is a request that
a consultant confirms.
