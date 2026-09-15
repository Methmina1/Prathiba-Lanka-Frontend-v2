/**
 * Renders both routes to a string (no browser needed) and checks their content.
 * Run with: npm run check:render
 *
 * Catches what a build cannot: undefined components, bad hooks, broken props - and it enforces the
 * split between the marketing home page and the dedicated /plan page.
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

const HOME_REQUIRED = [
  'PrathibaLanka',
  'The emerald isle',
  'Signature journeys',
  'Classical Heritage',
  'Conscious exploration',
  'Stories from the island',
  'Common questions',
  'The journey awaits',
]

// Planning and tracking now live on /plan only.
const HOME_FORBIDDEN = ['Request a journey', 'Send enquiry', 'Three steps, then the island']

const PLAN_REQUIRED = [
  'Plan your journey',
  'Request a journey',
  'Send enquiry',
  'Track a booking',
  'Three steps, then the island',
]

const home = render('/')
const plan = render('/plan')
const notFound = render('/nope')

const problems = [
  ...HOME_REQUIRED.filter((needle) => !home.includes(needle)).map((n) => `home is missing "${n}"`),
  ...HOME_FORBIDDEN.filter((needle) => home.includes(needle)).map((n) => `home still contains "${n}"`),
  ...PLAN_REQUIRED.filter((needle) => !plan.includes(needle)).map((n) => `/plan is missing "${n}"`),
  ...(notFound.includes('This path leads nowhere') ? [] : ['404 route did not render']),
]

console.log(`home: ${home.length.toLocaleString()} chars, /plan: ${plan.length.toLocaleString()} chars`)

if (problems.length > 0) {
  console.error(problems.map((p) => ` - ${p}`).join('\n'))
  process.exit(1)
}

console.log('Render check passed: home and /plan render as expected.')
