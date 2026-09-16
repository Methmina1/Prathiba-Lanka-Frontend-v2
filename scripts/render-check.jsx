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
  '/': ['The emerald isle', 'Signature journeys', 'Conscious exploration', 'Common questions'],
  '/journeys': ['Signature journeys', 'Search by destination'],
  // the sample data ships with the app, so detail routes render without a backend
  '/journeys/demo-1': ['Classical Heritage', 'About this journey', 'Request this journey'],
  '/journal': ['Stories from the island', 'Read the story'],
  '/journal/demo-1': ['When to visit Sri Lanka', 'All stories'],
  '/gallery': ['Where the journeys go', 'Sigiriya at dawn'],
  '/reviews': ['What people said afterwards', 'The train to Ella was the highlight'],
  '/about': ['Arranged by people who live here', 'How we got here'],
  '/contact': ['Talk to us', 'Track a booking'],  '/plan': ['Plan your journey', 'Request a journey', 'Track a booking'],
  '/login': ['Sign in', 'Create an account'],
  '/register': ['Create an account', 'At least 8 characters'],
  '/nope': ['This path leads nowhere'],
}

// the staff console, rendered with an admin session
const ADMIN_ROUTES = {
  '/admin': ['Admin console', 'Awaiting decision', 'New enquiries', 'Packages live'],
  '/admin/bookings': ['Admin console', 'Pending', 'Confirmed', 'Rejected'],
  '/admin/queries': ['Admin console', 'Waiting for a reply'],
  '/admin/packages': ['Admin console', 'New package'],
  '/admin/journal': ['Admin console', 'New story'],
  '/admin/gallery': ['Admin console', 'Add image or video'],
  '/admin/media': ['Admin console', 'Media library'],
  '/admin/content': ['Admin console', 'About and Contact', 'About page', 'Contact page'],
  '/admin/reviews': ['Admin console', 'Customers can review from their account page'],
}

// the home page must NOT contain the planning panels any more
const HOME_FORBIDDEN = ['Request a journey', 'Send enquiry', 'Three steps, then the island']

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
  check(path, path, expected, null, { forbidden: path === '/' ? HOME_FORBIDDEN : [] })
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
