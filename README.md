# PrathibaLanka - frontend

React front end for the PrathibaLanka travel agency backend. Vite, React Router, plain CSS - no UI
framework, so the palette and layout stay easy to change.

## Pages

| Route | Contents |
|---|---|
| `/` | Hero carousel, trust badges, philosophy, signature journeys (two rows of three, then a link to the full catalogue), sustainability, gallery, journal, reviews, FAQ, CTA band |
| `/journeys` | Full catalogue with destination search (`GET /api/packages`, `GET /api/packages/search`); deep links like `/journeys?destination=yala`; each card opens the full write-up in a dialog. **No prices** Ã¢â‚¬â€ see below |
| `/journeys/:id` | One journey: overview, the full description, the day-by-day itinerary as a dropdown, gallery strip, reviews for that package (with a way to add one), sticky quote card |
| `/journal` | **Opens on the province map and nothing else.** The map holds the middle of the section with nothing drawn around it: photographs of the province on the left, its description and districts on the right, the journeys we run through it directly beneath the map. Each district opens onto the facts and five sections the agency's district document gives it. Holding a province brings up the notes written about it as cards. The whole journal sits behind "Read all N stories" |
| `/journal/:id` | Full story, then more from the journal |
| `/gallery` | A wall of photographs in four columns, each cropped to a shape of its own (2:1, 3:2, square, 4:5), captions underneath, and a full-size viewer (arrow keys, Escape) |
| `/reviews` | Average score, rating distribution, every review, and the way to the review form for a signed-in customer |
| `/about` | Our story, the four things we hold to, milestones timeline |
| `/contact` | Contact cards (WhatsApp, email, office), the enquiry form, a link to the PIN tracker, and a band of everything the agency posts to: Facebook, Instagram, TikTok and WhatsApp |
| `/plan` | **Plan your journey**: enquiry form (`POST /api/contact`), PIN tracker (`GET /api/bookings/track`), how-it-works steps |
| `/enquiry/:token` | **Your enquiry**, opened from the link in the acknowledgement email: what you sent, the answer, and a box to write back (`GET /api/enquiries/{token}`, `POST /api/enquiries/{token}/messages`). No sign-in - the token is the credential |
| `/login`, `/register` | Customer sign in and sign up (`POST /api/auth/login`, `POST /api/auth/register`); the JWT is kept in localStorage |
| `/account` | Signed-in customers: their bookings (`GET /api/customer/bookings`), a new booking request (`POST /api/bookings/request`) and the review form (`POST /api/reviews`), which answers to `/account#review` |
| `/admin` | **Staff console.** Overview: pending/confirmed counts, live packages, new enquiries, recent bookings |
| `/admin/bookings` | Every booking with status filter, confirm (price + date) and reject |
| `/admin/queries` | Enquiries with a "waiting for a reply" filter, what they asked, the whole conversation, a reply that is emailed to the customer, and "I answered from my inbox" for the replies written in Gmail |
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
npm run check:render  # renders all 25 routes in Node and asserts their content
npm run test:e2e      # drives the built site in Chromium against a mocked API (Playwright)
npm run test:roles    # drives the real site against a real backend, as each role
npm run seed          # load the demo content into a running backend (optional)
node scripts/seed-production.mjs   # copy this instance's content to another (see below)
npm run extract:packages   # rate sheet (.xlsx) -> packages.json
npm run import:packages    # packages.json -> a running backend (see "The package catalogue")
```

Five suites cover the project between them, from the outside in:

| Suite | Needs | Covers |
|---|---|---|
| `scripts/api-tests.ps1` (backend repo) | a running API | every endpoint over HTTP - 185 checks |
| `mvn test` (backend repo) | nothing | the Spring context, the mail configuration |
| `npm run check:render` | nothing | all 25 routes in Node: undefined components, bad hooks, broken props |
| `npm run test:e2e` | nothing (API mocked) | 44 browser tests: layout, clicks, navigation |
| `npm run test:roles` | a running API + `BOOTSTRAP_ADMIN_PASSWORD` | 22 end-to-end journeys through the real UI and the real database, one per role |

`check:render` is the useful one: it renders every page (15 public, 8 screens under `/admin` with a
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
| a member of staff | signs in to the dashboard, **confirms the customer's booking** (which the customer then sees, with the agreed price), answers the visitor's enquiry from the console (and the customer then reads that answer on their own page and writes back to it), creates/edits/deactivates a package, writes/publishes/unpublishes/deletes a story, uploads a file and puts it in the gallery, edits the contact page and sees it on the public site, removes the customer's review, is refused the booking flow by the API, signs out |

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
so it needs no backend. Forty-four tests across three files:

| File | Covers |
|---|---|
| `public.spec.js` | the hero carousel and its four photographs (including that each image actually loads), the sign-in link being absent from the header and present on `/plan`, journey/journal/gallery covers, **no card or journey page showing a price**, a journey detail page and its day-by-day dropdown (three days, first open, the rest closed, "open all days"), the home page's two rows of three and its link to the rest, **the journal opens on the province map** (nine shapes that tile the island at Sri Lanka's proportions, no story cards until a province is chosen, and choosing one brings up its notes - then letting go puts the map back on its own), **the province panel** (the map in the middle with nothing drawn around it, the photographs to its left and the description close on its right, the packages underneath the map, and each district opening onto the district document's own sections), **the gallery wall and its viewer** (tiles of different shapes rather than one repeated band, the same wall after a reload, the caption under the picture, a click opening the photograph full size, the arrows moving through the set and Escape closing it), **the contact page's social band** (Facebook, Instagram, TikTok and WhatsApp, their labels and the tilt on the cards), **the WhatsApp bubble** (on the public pages, absent on the sign-in and account ones) **and the WhatsApp line on a journey**, **the route to the review form**, the full-description dialog (paragraphs, frozen page behind it, Escape), the About and 404 photography, **the customer's own enquiry page** (opened by the token from the email, showing the agency's answer and letting them write back) and what an unknown link says |
| `admin.spec.js` | both access rules, all nine console screens, the dashboard stat cards not overlapping, list contents, the status filter refetching, the sidebar, the page-content editor's two sections, **answering an enquiry** (the reply sent by email, the three states a reply can be in - emailed, answered in Gmail, never sent - and recording a reply written by hand) |
| `mobile.spec.js` | the phone header, the drawer, the hero with no sideways scroll, the console stacked with its own drawer, and no sideways scroll on the pages whose layout is not a plain grid (the gallery tiles, the contact social band, the journal with the map) |

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
| `/admin/queries` | `GET /api/admin/queries?onlyNew=true`, `PATCH /api/admin/queries/{id}/respond` (emails the customer), `POST /api/admin/queries/{id}/answered-outside` |
| `/enquiry/:token` | `GET /api/enquiries/{token}`, `POST /api/enquiries/{token}/messages` - public, the token is the credential |
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

The journal page opens on the map and nothing else: the island is the index, and it takes **the middle**
of the section with nothing drawn around it - no frame, no card, no shadow. The panel is arranged around
it: **photographs of the province on the left, what it is like on the right, and the journeys we run
through it directly under the map**, in the map's own column, so the answer belongs to the province being
pointed at. The nine provinces by name sit below all of that, for keyboards and phones. Picking a province
(or clicking it off that list) names it, gives its capital, its districts and their detail, holds the
panel, and brings up **the journal notes written about it** as cards underneath. Releasing it - clicking
the same province again - puts the page back to the map alone.

Below 1180px the three columns become one: the map keeps the middle by taking a row of its own, centred,
with the photographs and the description side by side underneath it and the journeys last. Below 760px
everything stacks in one column with the map still first.

One thing worth knowing before touching that layout: the middle column is **capped**
(`minmax(0, 400px)`) rather than left to size itself. An `auto` column takes the width of the widest thing
in it, and the widest thing was the row of nine province buttons - 850px of map column, which left the
photographs 139px wide and put the description 277px away from the map. With the buttons moved out of the
column and the cap in place, the map sits dead centre, the photographs get 384px each side and the
description starts 12px from the island.

Nine provinces are drawn in their real positions, so the outline they make is Sri Lanka.

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

**What each province is like.** Two layers, and they answer different questions. `src/data/provinceCopy.js`
holds the short description per province - what the place feels like, what you would do there, and the
season that suits it (the whale season at Mirissa, the elephant gathering on the Minneriya tank, the east
coast being the answer to the south-west monsoon). It is written for somebody who has never been to Sri
Lanka, it lives outside `src/data/provinces.js` on purpose (that file is generated, and re-running the map
script must not wipe the words), and it is what sits at the top of the panel.

**The district detail underneath it.** `src/data/districtDetail.js` is generated from the document the
agency supplied, `data/Sri_Lanka_25_Districts.docx`: one chapter per district, each with a geographical
profile, a history, an economy, what to see, and who lives there. The panel shows that as the province's
districts - the facts the document states outright (area, population) on the summary row, and each of the
five sections behind it, opened one district at a time, because a province's worth of prose laid open at
once is a wall rather than a description. The province's own totals (districts, square kilometres,
people) are summed from its districts, so correcting a district's figure in the source moves the
province's with it.

```bash
node scripts/build-district-detail.mjs
```

The generator reads the `.docx` directly - it is a zip, and the script reads the one entry it needs with
`zlib` rather than taking on a dependency for it. Each of the five sections runs to a couple of hundred
words, far more than a panel can show, so the generator keeps the opening sentences of each, cut at a
sentence boundary; the character and sentence ceilings live in `LIMITS` at the top of the script. Nothing
is paraphrased and nothing is invented: every line on the panel is a sentence from that document, which is
why the data is generated rather than typed in. Replace the document, run the script, and the panel
follows.

**Holding a province.** Hovering alone is not enough on this map: a province in the middle of the island
is hard to read while the pointer is still on it, and the route out to the photographs or the district
rows passes over whatever lies between. So a click **holds** the province: the pointer can cross the rest
of the map, or leave it entirely, and the panel stays put. A second click on the same province lets go and
hands the map back to the pointer. The panel carries a Hold/Held button that does the same thing, and
`Held` on the map's `data-held` attribute is what the browser test asserts against. Hovering only ever
fills this panel - `onProvince` is told what has been *held*, so the journal cards below cannot flicker
through nine provinces on the way to the one being aimed at.

**Photographs of a province.** `provincePhotos()` in `src/data/provincePlaces.js`, and the same idea as
everything else here: nothing is tagged. The photographs come from the province's own content, in the
order that puts the most specific picture first - the photograph of each journey whose itinerary goes
through it, then the cover of each note written about it, then gallery items linked to any of those
journeys (which is where pictures actually taken on a trip end up once somebody uploads them in the
console). So a photograph added in the console appears on the map by itself, and a province nobody has
photographed yet says so rather than filling the space with something generic.

**Which notes belong to a province?** `journalsInProvince()` in `src/data/provincePlaces.js` answers
it the same way the journeys are answered: from the places a post names, in its title, its standfirst
and its whole body. A note is *placed* by how many of the province's places it mentions, so the note
written about a province comes above one that mentions a single town on the way past. Nothing is
tagged by hand, and a post an editor writes tomorrow joins the map on its own.

**Every province has something.** There is one note per province, written for somebody who has never
been here and each naming the places it is about: Jaffna and the north, the two ancient capitals,
Wilpattu and the north-west coast, Colombo and the west, Kandy and the highlands, the east coast, Uva,
Adam's Peak and Sinharaja, and the south coast. `scripts/seed-demo-content.jsx` creates them (and
re-running it updates them in place, matching on title), and the browser suite asserts that no
province comes up empty rather than trusting that it does not.

**Which journeys go through a province?** `src/data/provincePlaces.js` answers that from the places
each journey names - its title, its region, its summary and every line of its day-by-day itinerary -
so the panel stays right as packages are added or edited in the console, with no extra field to fill
in. Journeys are ranked by how much of the trip is in that province (`3 of 7 days here`), so the tour
that is mostly about a place comes above the one that merely passes through it, and the strip across
the bottom of the panel lists four with a link to the rest. Every entry is a link into the catalogue.

The patterns have to be specific, and the near-misses are the interesting part:

- **Galle** is Southern, **Galle Face** is in Colombo - so the Southern pattern looks ahead and
  excludes it, or every tour that starts in the capital would claim the south coast.
- **Little Adam's Peak** is in Ella (Uva); **Adam's Peak** (Sri Pada) is 100 km away in Sabaragamuwa.
  One keyword would have merged them, so that pattern carries an `unless`.

## The package catalogue

The journeys on the site are the agency's real ones, and they come from the rate workbook - one
overview sheet plus one sheet per package, each with the day-by-day itinerary, the hotel table and
the base price. Two commands turn it into records, both of which talk to the backend through the same
admin API the console uses, so everything they write stays editable in Admin Ã¢â€ â€™ Packages:

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
| Experience (`Cultural & Heritage`, Ã¢â‚¬Â¦) | `destination` - the pill on the card and the eyebrow on the detail page |
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
Admin Ã¢â€ â€™ Packages Ã¢â€ â€™ *Full description* afterwards like every other field.

Note on the numbers: the two price columns in the workbook disagree (the overview lists 550-2100 for
the 13 tours, each package sheet lists 650-6500). The importer uses the package sheet, and prints the
overview figure it did not use, so the difference is visible on every run rather than silent.

**No prices are published.** The price is still stored on every package, imported from the workbook
and edited in the console, and the staff console still shows it (Admin Ã¢â€ â€™ Packages, and the figure an
admin agrees when confirming a booking). What the site does not do any more is *print* one: the
cards, the journey page, the full-description dialog and the province map's journey list all leave it
out, because a "from" figure on a card is a number nobody is actually offered - every journey is
costed against the traveller's own dates, party and hotels. Where a price used to be, the journey
page's quote card now says how pricing works. `tests/e2e/public.spec.js` fails if a `$` reappears on
a card or on a journey page.

**Covers.** Each of the thirteen journeys has a photograph, chosen from the picture library for the
part of the island that journey is about (the leopard for the Yala-heavy tours, the tea estates for
the hill-country ones, the fort and the dancer for the heritage ones). They are ordinary media
library entries, so swapping one is a two-click job in Admin Ã¢â€ â€™ Packages.

**Fallbacks.** If the backend is down or a table is empty, `src/data/fallback.js` is rendered instead
and a small notice explains why, so no page ever looks broken. The account area has no fallback - it
needs a real session - so `/account` sends signed-out visitors to `/login?next=/account`.

**Reviews are the exception.** There is no sample review in the fallbacks, and the home strip and
`/reviews` show an empty state until real ones arrive. A review is a claim that a named person
travelled with the agency and said something about it; writing those, even behind a "sample" notice,
is not ours to do. The browser tests still serve one from their mocked API (`tests/e2e/fixtures.js`,
which never ships) so the review cards themselves stay covered.

**How a customer writes one.** The form is on `/account` (`#review`), and `ReviewCallToAction` is the
single door to it: signed-in customers go straight there, visitors are sent to sign in first, staff
are not offered it at all (the endpoint wants `ROLE_CUSTOMER`). Both the home strip and the reviews
page used to send people to `/plan`, which holds the enquiry form and the PIN tracker and no review
form whatsoever - so "Travelled with us? Tell us about it" led somewhere the review could not be
written. The home strip points a visitor at `/reviews` rather than at a sign-in form, because the home
page deliberately offers no sign-in link.

## Design system

`src/styles/theme.css` holds every token. The palette is deep ink + metallic gold with the logo's
emerald as a secondary note:

- `--ink-950 Ã¢â‚¬Â¦ --ink-500` page and section backgrounds
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

**The gallery wall.** The gallery page (`/gallery`) is a wall rather than a grid: photographs are laid
out down four columns (`column-count`, three, two and then one down the breakpoints) and each one is
cropped to **a shape of its own** - 2:1 for most, then 3:2, square and 4:5 - so a tall picture takes more
of its column instead of leaving a hole and the bottom edge is ragged, the way a wall of prints is.
Uniform rows of identical bands read as a spreadsheet; this reads as somebody's photographs. Captions sit
underneath the pictures rather than over them, and whatever a crop takes away is in the viewer at the
photograph's own proportions.

Which photograph gets which shape is `shapeFor()` in `src/pages/GalleryPage.jsx`: a hash of the
photograph's own key, never `Math.random` and never its position. The wall looks irregular but **does not
reshuffle** when somebody reloads it, and uploading one new photograph does not reshape everything that
follows it. Hovering zooms the picture inside its tile, turns the border gold and brings up a small
magnifier, which is what says the photograph can be opened before anybody clicks it. A clip keeps its own
controls and is not clickable.

**The viewer.** Clicking a photograph opens `components/ui/Lightbox.jsx` - a dialog over a dark
backdrop, with the caption and its place in the set underneath, arrow keys or the buttons to move
through the photographs already on the page, and Escape, the close button or a click on the backdrop
to leave. Focus moves into it on open, the page behind it is frozen (body scroll locked), and the
same item renders a video clip with controls if one is opened. Nothing about the layout is generated
per position any more: no tilt, no tape, no numbering - the photograph is the design, and the size
of a tile never depends on where it happens to sit in the grid.

**The contact page.** It is the one page allowed to move: two soft lights drift behind the cards and
the form, a dashed thread travels slowly behind the row of contact cards, those cards lift with a
pulsing ring on hover, the office marker pulses on the map and the map itself drifts, and the band at
the bottom (`src/data/social.js`, the same accounts the footer uses) presents Facebook, Instagram,
TikTok and WhatsApp as tilted cards with the brand colour as a soft glow behind each - never as text,
because blue or pink on ink is not readable. All of it is scoped to `.contact-page` and all of it is
CSS.

**WhatsApp, in three places and one number.** The number is a *contact card* (`icon: 'whatsapp'`), so
it is edited in Admin Ã¢â€ â€™ Contact like the email and the office - `whatsappFrom()` in `data/social.js`
reads that card and falls back to `CONTACT_FALLBACK` for a database that has not been edited yet. On
top of the card it appears in the footer's "Talk to us" column, on a journey page's quote card as
"ask about this journey", in the contact band as one of the profiles, and as the bubble in the corner
of every public page (`components/layout/WhatsAppFab.jsx`). That bubble used to be a floating link to
`/plan` - the class and the icon were already saying WhatsApp, and the CTA band carries its own
"Begin your journey" button for that job. It is hidden on `/account`, `/login` and `/register`: those
are a customer's own business, and neither belongs on the admin console's screens either.

## Seeding a production database

A fresh database has the schema and an administrator and nothing else. `scripts/seed-production.mjs`
fills it from an instance that already has the content — every journey, story, gallery item, photograph
and page of copy:

```bash
# preview what would happen
node scripts/seed-production.mjs --from http://localhost:8080 --to https://prathibalanka.com --dry-run

# do it
node scripts/seed-production.mjs --from http://localhost:8080 --to https://prathibalanka.com
```

It talks to both instances through their own APIs as an administrator
(`BOOTSTRAP_ADMIN_PASSWORD`, or `--admin-password`), so it works against a deployed site without a
database connection:

| | |
|---|---|
| **Media** | Each file is downloaded from the source and uploaded to the target; every URL that pointed at the old copy is rewritten to the new one. Matched on the file's name, so a second run skips what is already there |
| **Journeys** | Created from the source's own record — title, price, itinerary, status, photograph. Matched on title |
| **Stories** | Created and then published, carrying their **original `publishedAt`** so a seeded archive is not all dated the day of the import |
| **Gallery** | Added when the photograph is not already in the target's gallery, with its caption and its link to a journey |
| **About / Contact** | Replaced, including the media URLs inside them — that copy is meant to be overwritten |

It is additive and idempotent: it never deletes, and a second run reports everything already there.
Run it against a **copy** first if you want to see it work; the recipe used to prove it is a second
database on the same Postgres with its own media directory:

```bash
docker exec -e PGPASSWORD=secret travel_agency_db psql -U travel_admin -d postgres \
  -c "CREATE DATABASE travel_agency_staging OWNER travel_admin;"
# boot the API against it on another port, with MEDIA_DIR=.staging-media, then:
node scripts/seed-production.mjs --from http://localhost:8080 --to http://localhost:8090
```

**What it cannot move**, because the API deliberately has no route that writes them: customer accounts
(people register themselves), bookings, enquiries and reviews. Those are records of things people did,
not content. The administrator on the target comes from `BOOTSTRAP_ADMIN_PASSWORD` on its first boot.

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
| `SITE_URL` | build | The address the site is published at, for the canonical link and the `og:url`/`og:image` sharing tags. Defaults to `https://prathibalanka.com`; set it to the Railway domain if the site is not on the agency's domain yet |
| `BACKEND_URL` | runtime | Where nginx forwards `/api` and `/media`. Defaults to `http://backend.railway.internal:8080` |
| `PORT` | runtime | Port nginx listens on. Railway injects it; 80 otherwise |

`index.html` carries `%SITE_URL%` rather than a hard-coded domain, and `vite.config.js` substitutes it at
build time — the tags have to be absolute, and a link preview fetched by WhatsApp or Facebook has no
page to resolve a relative address against. `public/images/sl/share.jpg` is the picture that goes with
it: 1200×630, the shape every platform falls back to, cropped from the CTA band photograph by
`scripts/optimize-images.ps1`'s sibling one-off (the crop is `cta-band.jpg`, weighted above centre so the
horizon survives).

### Railway

Two services from two repositories Ã¢â‚¬â€ this one and the API:

1. *New Ã¢â€ â€™ GitHub repo Ã¢â€ â€™ this repository*. Railway builds the `Dockerfile`; `railway.json` sets the
   builder, the `/healthz` health check and the restart policy.
2. Add a public domain (*Settings Ã¢â€ â€™ Networking Ã¢â€ â€™ Generate Domain*). That is the address the agency
   uses; the API needs no public domain of its own.
3. Set `BACKEND_URL` to the API service, one of:
   - `http://<api-service>.railway.internal:8080` Ã¢â‚¬â€ private networking inside the project, no egress;
   - `https://<api-service>.up.railway.app` Ã¢â‚¬â€ if the API has (or gets) a public domain.

   The default assumes that service is called `backend`, and the port has to be the one the API
   listens on. nginx resolves this at start-up, so if the API's address changes, restart this
   service.

`nginx/default.conf.template` is rendered on every container start (`${PORT}`, `${BACKEND_URL}`), so
the image never needs rebuilding when the backend moves. `nginx/05-check-backend-url.envsh` is sourced
before that rendering: it fails with an explanation rather than an nginx stack trace when
`BACKEND_URL` is missing or empty, strips a trailing slash from it, and prints the address it will
use. It is an `.envsh` because the nginx entrypoint *sources* those (so its changes reach `envsubst`)
and ignores a script that is not executable Ã¢â‚¬â€ which is why the Dockerfile chmods it.

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
(Settings Ã¢â€ â€™ Pages Ã¢â€ â€™ Source: GitHub Actions). Until then it is skipped, so the pipeline cannot fail
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
  data/districtDetail.js   the 25 districts from the agency's document: facts and five sections (generated)
  data/provincePlaces.js   which places belong to which province: the map's journeys, its notes and its photographs
  auth/AuthContext.jsx     session (JWT in localStorage), login/register/logout
  hooks/usePageContent.js  loads an editable page section and merges it over the defaults
  styles/theme.css         design tokens
  styles/base.css          reset, type, buttons, grid, reveal/motion utilities
  styles/components.css    section and page styles (including the gallery grid and the contact effects)
  styles/admin.css         staff console theme (scoped to .admin)
  components/layout/       Header, Footer, PageHero, SplashIntro, WhatsAppFab
  components/plan/         EnquiryForm, TrackBooking  (used by /plan and /contact)
  components/admin/        AdminLayout (role guard + sidebar), AdminUI (table, dialog, pills),
                           MediaPicker, useAdmin
  components/sections/     Home page sections (ProvinceMap is rendered by the journal page)
  components/ui/           Icons, Scenery, PackageCard, StoryDialog, DayAccordion, ReviewCallToAction,
                           Reveal, ScrollProgress, MediaFigure, CoverImage, Lightbox
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
  build-district-detail.mjs  data/Sri_Lanka_25_Districts.docx -> src/data/districtDetail.js
  seed-production.mjs      every journey, story, photograph and page of copy -> another instance
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
| Link previews (WhatsApp, Facebook) | `public/images/sl/share.jpg`, 1200x630, named by the `og:image` tag in `index.html` | replacing the file, or editing the `%SITE_URL%`-based tag |`n| Home hero carousel, page header bands, the "fewer places" panel, the CTA band, the contact map panel, the 404 page | `public/images/sl/*.jpg`, mapped slot by slot in `src/data/photos.js` | replacing the file, or editing that map (a developer change) |
| Journey cards and journey headers | the package's `imageUrl`, seeded per journey by `npm run import:packages` from `data/package-copy.json` | Admin Ã¢â€ â€™ Packages Ã¢â€ â€™ Cover image (media library) |
| Journal cards, featured story, story cover | the post's `coverImageUrl` | Admin Ã¢â€ â€™ Journal Ã¢â€ â€™ Cover image (media library) |
| Gallery, home gallery strip | gallery items (image or short video) | Admin Ã¢â€ â€™ Gallery, files from Admin Ã¢â€ â€™ Media library |
| About and Contact header bands and the About story panel | `hero.image` / `story.image` in the page content | Admin Ã¢â€ â€™ About and Contact (media library) |
| Journey page "from the road" strip | gallery items linked to that journey | Admin Ã¢â€ â€™ Gallery Ã¢â€ â€™ link to a package |

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
