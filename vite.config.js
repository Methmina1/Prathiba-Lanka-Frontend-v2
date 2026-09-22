import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * The address the site is published at, for the canonical link and the sharing tags in index.html.
 *
 * Those have to be absolute - a crawler or a chat app fetching a link preview has no page to resolve a
 * relative one against - and they have to name the deployed domain rather than wherever the build
 * happened. So the html carries %SITE_URL% and this replaces it, from SITE_URL in the environment, at
 * build time. Deploying to a Railway domain rather than the agency's own is one variable, not an edit:
 *
 *   SITE_URL=https://prathibhalanka-production.up.railway.app npm run build
 *
 * It has a default so a local build is never broken by a missing variable, and a trailing slash is
 * dropped so `%SITE_URL%/journeys` cannot come out as `//journeys`.
 */
const SITE_URL = (process.env.SITE_URL ?? 'https://prathibalanka.com').replace(/\/+$/, '')

/** Replaces %SITE_URL% in index.html, and warns rather than shipping a literal placeholder. */
function siteUrlPlugin() {
  return {
    name: 'prathibalanka-site-url',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        if (!/%SITE_URL%/.test(html)) return html
        return html.replaceAll('%SITE_URL%', SITE_URL)
      },
    },
    configResolved(config) {
      if (config.command === 'build') {
        console.log(`  site url for sharing tags: ${SITE_URL}`)
      }
    },
  }
}

export default defineConfig({
  // VITE_BASE_PATH is only set by the Pages deployment job (app served from /<repo>/).
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react(), siteUrlPlugin()],
  server: {
    port: 5173,
    // The backend already allows http://localhost:5173 in its CORS config.
    open: false,
  },
  preview: {
    port: 4173,
  },
})
