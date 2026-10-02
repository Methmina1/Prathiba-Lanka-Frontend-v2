#!/usr/bin/env node
/**
 * Writes a real HTML file per public route, with that route's head tags already in it.
 *
 *   npm run build          (runs this after vite build - see package.json)
 *   node scripts/generate-route-html.mjs --dry-run
 *
 * Why this exists, given src/seo/RouteSeo.jsx already sets the same tags at runtime:
 *
 *   RouteSeo only helps software that runs JavaScript. Google does, eventually and on a throttled
 *   budget. WhatsApp, Facebook, LinkedIn, Slack, Bing's and Twitter's preview fetchers do not - they
 *   read the bytes the server sends and stop there. Before this script, every journey link shared in
 *   WhatsApp showed the same generic homepage card, whichever trip it pointed at, because the shell
 *   that nginx serves carries the homepage's tags and nothing else.
 *
 *   It also gives nginx a file to find for each route, which is what makes a real 404 possible for a
 *   path that is not a page (see nginx/default.conf.template).
 *
 * What it does NOT do: render the page body. React still fills #root in the browser, so this fixes the
 * head, not the markup. Rendering the body needs either a browser at build time or a server that can
 * run React, and both are a bigger change than this - see the README's SEO section.
 *
 * No dependencies: it edits the html Vite just produced, using the same SEO map the app uses.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { NOT_FOUND_SEO, PAGE_SEO, PRIVATE_PAGE_SEO, SITE, SITE_URL, withBrand } from '../src/seo/seo.js'

const dryRun = process.argv.includes('--dry-run')
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

let shell
try {
  shell = await readFile(join(dist, 'index.html'), 'utf8')
} catch {
  console.error('No dist/index.html - run `vite build` first (npm run build does both).')
  process.exit(1)
}

/** Replaces a meta tag's content, adding the tag if the shell does not have it. */
function setMeta(html, attr, key, value) {
  const tag = new RegExp(`<meta\\s+${attr}="${key}"[^>]*>`, 'i')
  const next = `<meta ${attr}="${key}" content="${escapeAttribute(value)}" />`
  return tag.test(html) ? html.replace(tag, next) : html.replace('</head>', `  ${next}\n</head>`)
}

function setLink(html, rel, href) {
  const tag = new RegExp(`<link\\s+rel="${rel}"[^>]*>`, 'i')
  const next = `<link rel="${rel}" href="${escapeAttribute(href)}" />`
  return tag.test(html) ? html.replace(tag, next) : html.replace('</head>', `  ${next}\n</head>`)
}

function escapeAttribute(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

/** The head for one page, applied to a copy of the shell. */
function renderShell(path, { title, description, noindex }) {
  const fullTitle = withBrand(title)
  const canonical = `${SITE_URL}${path === '/' ? '/' : path}`
  const image = `${SITE_URL}/images/sl/share.jpg`

  let html = shell
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeAttribute(fullTitle)}</title>`)
    .replace(
      /<meta\s+property="og:url"[^>]*>/i,
      `<meta property="og:url" content="${escapeAttribute(canonical)}" />`,
    )

  html = setMeta(html, 'name', 'description', description)
  html = setMeta(html, 'name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
  html = setMeta(html, 'property', 'og:type', 'website')
  html = setMeta(html, 'property', 'og:site_name', SITE.name)
  html = setMeta(html, 'property', 'og:title', fullTitle)
  html = setMeta(html, 'property', 'og:description', description)
  html = setMeta(html, 'property', 'og:image', image)
  html = setMeta(html, 'name', 'twitter:title', fullTitle)
  html = setMeta(html, 'name', 'twitter:description', description)
  html = setMeta(html, 'name', 'twitter:image', image)
  html = setLink(html, 'canonical', canonical)

  return html
}

/**
 * The shell nginx serves for the routes that cannot have a file of their own: a journey or post id
 * lives in the database, not in the repository, so no build can enumerate them.
 *
 * Its head is deliberately neutral rather than the homepage's. Leaving the homepage's canonical in it
 * would tell a crawler that /journeys/7 *is* the homepage, which is a worse lie than saying nothing;
 * with the canonical and og:url removed, the app sets both correctly as soon as it loads, and a
 * non-JavaScript fetcher simply sees the brand and no claim about which page this is.
 */
function renderSpaShell() {
  return shell
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeAttribute(`${SITE.name} | ${SITE.tagline}`)}</title>`)
    .replace(/\s*<link\s+rel="canonical"[^>]*>/i, '')
    .replace(/\s*<meta\s+property="og:url"[^>]*>/i, '')
}

/**
 * Where a route's file goes: "/" is dist/index.html, "/about" is dist/about.html.
 *
 * A file rather than a directory, deliberately: nginx would redirect /about to /about/ for a
 * directory, and the canonical tag on the page says /about.
 */
async function writeRoute(path, seo) {
  const html = renderShell(path, seo)
  const target = path === '/' ? join(dist, 'index.html') : join(dist, `${path.slice(1)}.html`)
  if (dryRun) {
    console.log(`  would write ${target.replace(root, '.')}`)
    return
  }
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, html, 'utf8')
}

// Public pages first, then the pages that exist for people but must not rank: they need a file of
// their own too, or nginx's real-404 handling would make signing in impossible.
const routes = [...Object.entries(PAGE_SEO), ...Object.entries(PRIVATE_PAGE_SEO)]
console.log(`  route html for ${routes.length} pages (canonical host ${SITE_URL})`)

for (const [path, seo] of routes) {
  await writeRoute(path, seo)
}

// The page nginx serves with a 404 status for a path that is not one of the above, so a mistyped URL
// is a real 404 to a crawler rather than a 200 with the app inside it.
if (dryRun) {
  console.log('  would write ./dist/404.html and ./dist/spa.html')
  console.log('Dry run: nothing written.')
} else {
  await writeFile(join(dist, '404.html'), renderShell('/404', NOT_FOUND_SEO), 'utf8')
  await writeFile(join(dist, 'spa.html'), renderSpaShell(), 'utf8')
  console.log(`  wrote ${routes.length} pages, 404.html and spa.html`)
}
