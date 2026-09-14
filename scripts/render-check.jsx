/**
 * Renders the whole home page to a string (no browser needed) and checks that the main sections
 * and the API-loaded placeholders are present. Run with: npm run check:render
 *
 * Catches the class of mistake a build cannot: undefined components, bad hooks, broken props.
 */
import { renderToString } from 'react-dom/server'
import App from '../src/App.jsx'

const REQUIRED = [
  'PrathibaLanka',
  'The emerald isle',
  'Signature journeys',
  'Classical Heritage',
  'Conscious exploration',
  'Stories from the island',
  'Track a booking',
  'Common questions',
  'The journey awaits',
]

const html = renderToString(<App />)

const missing = REQUIRED.filter((needle) => !html.includes(needle))

console.log(`Rendered ${html.length.toLocaleString()} characters of HTML.`)

if (missing.length > 0) {
  console.error(`Missing expected content: ${missing.join(', ')}`)
  process.exit(1)
}

console.log('Render check passed: all expected sections are present.')
