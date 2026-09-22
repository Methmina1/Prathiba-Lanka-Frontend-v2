/**
 * Renders every route to a string (no browser needed) and checks its content.
 * Run with: npm run check:render
 *
 * Catches what a build cannot: undefined components, bad hooks, broken props - across the whole
 * site, not just the home page.
 */
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App.jsx'

const ADMIN_SESSION = { token: 'test', email: 'admin@test.com', role: 'ROLE_ADMIN', userId: 1 }
const CUSTOMER_SESSION = { token: 'test', email: 'customer@example.com', role: 'ROLE_CUSTOMER', userId: 2 }

const render = (path, initialSession = null) =>
  renderToString(
    <MemoryRouter initialEntries={[path]}>
      <App initialSession={initialSession} />
    </MemoryRouter>
  )

// path -> strings that must appear in the rendered markup
const ROUTES = {
  '/': [
    // the four hero themes: coast, wildlife, culture, sunsets (only the active slide's copy renders)
    'Turquoise water',
    'Signature journeys',
    'Conscious exploration',
    'Common questions',
    // the photographs that ship with the site (see src/data/photos.js)
    '/images/sl/hero-1.jpg',
    '/images/sl/hero-2.webp',
    '/images/sl/hero-3.jpg',
    '/images/sl/hero-4.jpg',
    // the "fewer places" frame, which now uses a gallery photograph
    '/images/sl/seed-gallery-17.jpg',
    '/images/sl/cta-band.jpg',
    '/images/sl/tile-1.jpg',
  ],
  '/journeys': ['Signature journeys', 'Search by destination', '/images/sl/page-journeys.jpg'],
  // the sample data ships with the app, so detail routes render without a backend
  '/journeys/demo-1': ['Classical Heritage', 'About this journey', 'Request this journey'],
  // The journal opens on the map alone: the notes appear once a province is picked, and the full
  // list is behind the button in "Every story".
  '/journal': [
    'Stories from the island',
    'Nine provinces, one island',
    'Central Province',
    'Every story',
    'Read all',
  ],
  '/journal/demo-1': ['When to visit Sri Lanka', 'All stories', '/images/sl/journal-1.jpg'],
  // a plain grid of square tiles; with no backend the shipped photographs run through it, and those
  // carry no captions, so only the notice and the first tile can be matched
  '/gallery': ['Where the journeys go', 'Nothing has been uploaded yet', '/images/sl/tile-1.jpg'],
  // No sample reviews ship with the app, so the page renders its empty state without a backend.
  '/reviews': ['What people said afterwards', 'No reviews yet', 'Sign in to write a review'],
  // The customer's own enquiry: without a backend the lookup cannot finish, so what renders is the
  // heading and the note that says it is looking. The token is theirs, so no route is special-cased.
  '/enquiry/demo-token': ['Your enquiry', 'Looking up your enquiry'],
  '/about': ['Arranged by people who live here', 'How we got here', '/images/sl/about-story.jpg'],
  // the social accounts, straight from src/data/social.js - plus the WhatsApp bubble, which is on
  // every public page
  '/contact': [
    'Talk to us',
    'Track a booking',
    '/images/sl/contact-map.jpg',
    'Come along between journeys',
    '@prathibha_lanka_voyeages',
    'TikTok',
    'Message us on WhatsApp',
  ],
  '/plan': [
    'Plan your journey',
    // the request form (what the Journey cards open) and the general enquiry form beside it
    'Request a journey',
    'Ask us something',
    'Track a booking',
    'Sign in',
    'Create an account',
  ],
  '/login': ['Sign in', 'Create an account'],
  '/register': ['Create an account', 'At least 8 characters'],
  '/nope': ['This path leads nowhere', '/images/sl/not-found.jpg'],
}

// the staff console, rendered with an admin session
const ADMIN_ROUTES = {
  '/admin': ['Admin console', 'Awaiting decision', 'New enquiries', 'Packages live'],
  // The console calls the status Cancelled; the API and the database still store REJECTED.
  '/admin/bookings': ['Admin console', 'Pending', 'Confirmed', 'Cancelled'],
  '/admin/queries': ['Admin console', 'Waiting for a reply'],
  '/admin/packages': ['Admin console', 'New package'],
  '/admin/journal': ['Admin console', 'New story'],
  '/admin/gallery': ['Admin console', 'Add image or video'],
  '/admin/media': ['Admin console', 'Media library'],
  '/admin/content': ['Admin console', 'About and Contact', 'About page', 'Contact page'],
  '/admin/reviews': ['Admin console', 'Customers can review from their account page'],
}

// the home page must NOT contain the planning panels any more, and the header must not offer a
// sign-in link - that lives on the plan page now
const HOME_FORBIDDEN = [
  'Request a journey',
  'Send enquiry',
  'Three steps, then the island',
  'navbar__auth',
  'Sign in',
]

/**
 * Pages that must not carry something. The WhatsApp bubble is the interesting one: it belongs to the
 * pages a customer-to-be reads, and not to the sign-in or account pages - see WhatsAppFab.jsx.
 */
const PER_ROUTE_FORBIDDEN = {
  '/': HOME_FORBIDDEN,
  '/login': ['Message us on WhatsApp'],
  '/register': ['Message us on WhatsApp'],
}

/** The bubble itself has to be there on the pages that are for them. */
const PER_ROUTE_REQUIRED = {
  '/journeys': ['Message us on WhatsApp'],
  '/about': ['Message us on WhatsApp'],
}

const problems = []

const check = (label, path, expected, session, { min = 2000, forbidden = [] } = {}) => {
  const html = render(path, session)

  if (html.length < min) {
    problems.push(`${label} rendered only ${html.length} characters`)
    return html
  }

  for (const needle of expected) {
    if (!html.includes(needle)) problems.push(`${label} is missing "${needle}"`)
  }

  for (const needle of forbidden) {
    if (html.includes(needle)) problems.push(`${label} still contains "${needle}"`)
  }

  console.log(`${label.padEnd(24)} ${html.length.toLocaleString().padStart(7)} chars`)
  return html
}

for (const [path, expected] of Object.entries(ROUTES)) {
  check(path, path, [...expected, ...(PER_ROUTE_REQUIRED[path] ?? [])], null, {
    forbidden: PER_ROUTE_FORBIDDEN[path] ?? [],
  })
}

for (const [path, expected] of Object.entries(ADMIN_ROUTES)) {
  check(path, path, expected, ADMIN_SESSION)
}

// guard: a signed-in customer must not reach the console
check('/admin (customer)', '/admin', ['Admin access required'], CUSTOMER_SESSION, {
  min: 100,
  forbidden: ['Packages live'],
})

// guard: a signed-out visitor is redirected to the sign-in page (nothing renders in its place)
check('/admin (signed out)', '/admin', [], null, { min: 0, forbidden: ['Admin console', 'Packages live'] })

if (problems.length > 0) {
  console.error('\n' + problems.map((problem) => ` - ${problem}`).join('\n'))
  process.exit(1)
}

const total = Object.keys(ROUTES).length + Object.keys(ADMIN_ROUTES).length + 2
console.log(`\nRender check passed: ${total} routes render as expected.`)
