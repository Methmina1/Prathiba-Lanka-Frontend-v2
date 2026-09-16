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

const render = (path) =>
  renderToString(
    <MemoryRouter initialEntries={[path]}>
      <App />
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
  '/contact': ['Talk to us', 'Track a booking'],
  '/plan': ['Plan your journey', 'Request a journey', 'Track a booking'],
  '/login': ['Sign in', 'Create an account'],
  '/register': ['Create an account', 'At least 8 characters'],
  '/nope': ['This path leads nowhere'],
}

// the home page must NOT contain the planning panels any more
const HOME_FORBIDDEN = ['Request a journey', 'Send enquiry', 'Three steps, then the island']

const problems = []

for (const [path, expected] of Object.entries(ROUTES)) {
  const html = render(path)

  if (html.length < 2000) {
    problems.push(`${path} rendered only ${html.length} characters`)
    continue
  }

  for (const needle of expected) {
    if (!html.includes(needle)) problems.push(`${path} is missing "${needle}"`)
  }

  if (path === '/') {
    for (const needle of HOME_FORBIDDEN) {
      if (html.includes(needle)) problems.push(`home still contains "${needle}"`)
    }
  }

  console.log(`${path.padEnd(20)} ${html.length.toLocaleString().padStart(7)} chars`)
}

if (problems.length > 0) {
  console.error('\n' + problems.map((problem) => ` - ${problem}`).join('\n'))
  process.exit(1)
}

console.log(`\nRender check passed: ${Object.keys(ROUTES).length} routes render as expected.`)
