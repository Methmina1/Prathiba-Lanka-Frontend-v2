# PrathibaLanka - frontend

React home page for the PrathibaLanka travel agency backend. Built with Vite, plain CSS and no UI
framework, so the palette and layout stay easy to change.

## Requirements

- Node 20+ (developed on Node 24)
- The backend running on `http://localhost:8080` for live data (optional - see below)

## Run

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

The backend already whitelists `http://localhost:5173` in its CORS configuration, so no proxy is
needed. Point the frontend somewhere else with an env file:

```bash
# .env.local
VITE_API_BASE_URL=https://api.example.com
```

## Build

```bash
npm run build        # -> dist/
npm run preview      # serve the production build on http://localhost:4173
npm run check:render # renders the page in Node and asserts the sections exist
```

## How it talks to the API

| Section | Endpoint | Notes |
|---|---|---|
| Signature journeys | `GET /api/packages` | active packages only |
| Gallery | `GET /api/gallery` | falls back to illustrations when empty |
| Journal | `GET /api/journal/published` | published posts only |
| Reviews | `GET /api/reviews` | - |
| Enquiry form | `POST /api/contact` | public; name, email, subject, message |
| PIN tracker | `GET /api/bookings/track?pin=` | public; shows status, travellers, dates |

Every section degrades gracefully: if the backend is down or a table is empty, sample content from
`src/data/fallback.js` is rendered instead and a small notice explains why. Bookings and reviews are
never sent from the home page - submission requires a customer token (`POST /api/bookings/request`
and `POST /api/reviews` are authenticated), which belongs to the booking flow, not the landing page.

## Structure

```
src/
  api/client.js            fetch wrapper (base URL, timeouts, typed errors)
  hooks/useApi.js          loader with loading / live / fallback states
  data/fallback.js         sample packages, journal posts, reviews, FAQ copy
  styles/theme.css         design tokens (colour, type, spacing, shadows)
  styles/base.css          reset, typography, buttons, grid, utilities
  styles/components.css    section styles
  components/layout/       Header (topbar, sticky nav, mobile menu), Footer
  components/sections/     Hero, TrustBar, Philosophy, Packages, Sustainability,
                           Gallery, Journal, Reviews, Plan, Faq, CtaBand
  components/ui/           Icons, Scenery (illustrations), PackageCard
```

## Design tokens

`src/styles/theme.css` holds the palette, taken from the logo: `primary-600` is the logo's emerald
and `accent-500` its gold, with sage neutrals and status colours (success/warning/error/info).
Contrast pairs used in the UI are AA or better - note that gold is only ever paired with dark ink
(8.6:1), never white (2.05:1).

Change the palette in one place and the whole page follows.

## Images

There are no external image dependencies. Scenes are drawn as SVG by `components/ui/Scenery.jsx`
(six variants: temple, safari, tea, coast, train, hills). To use photography instead, drop files in
`public/images/` and replace a `<Scenery />` with an `<img />`; the gallery already renders live
`imageUrl` values from the API when the gallery table has rows.

## Not built yet

Package detail page, booking flow (customer login -> request -> PIN), admin dashboard, and routing
(the home page is a single scroll with anchor navigation).
