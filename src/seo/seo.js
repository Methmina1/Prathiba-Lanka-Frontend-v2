/**
 * The single place that decides what a page tells a search engine.
 *
 * Search engines read one <title>, one meta description and one canonical URL per page. Until this
 * file existed, every route on this site served the same three - the ones written into index.html -
 * which is why none of the keyword work could take effect: a canonical tag pointing at the homepage
 * from every page tells Google those pages are duplicates of the homepage.
 *
 * Two things live here:
 *
 *   PAGE_SEO    one entry per static route: the title and description that route should serve.
 *   applySeo    the only code that touches the document head, so the rules stay in one place.
 *
 * The keyword targets come from src/data/seoKeywords.js (which mirrors PrathibhaLanka_SEO_Keywords.docx):
 * one target phrase per page, so two pages never compete for the same query.
 *
 * The bare domain carries no DNS record at the time of writing, so the canonical host is www. A
 * canonical pointing at an address that does not resolve is worse than none at all - see the note in
 * README about which host is canonical.
 */

/** Replaced at build time by vite.config.js, so it matches the sharing tags in index.html. */
export const SITE_URL = (typeof __SITE_URL__ === 'string' ? __SITE_URL__ : 'https://www.prathibalanka.com')
  .replace(/\/+$/, '')

export const SITE = {
  name: 'PrathibhaLanka Voyages',
  shortName: 'PrathibhaLanka',
  url: SITE_URL,
  tagline: 'Private, tailor-made journeys through Sri Lanka',
  /** The agency answers from Kurunegala; the address is a trust signal for "tour operator" queries. */
  address: {
    addressLocality: 'Kurunegala',
    addressRegion: 'North Western Province',
    addressCountry: 'LK',
  },
  telephone: '+94760484088',
  sameAs: ['https://www.tiktok.com/@prathibha_lanka_voyages'],
}

/** An absolute URL for a site path, which canonical and og:url tags both require. */
export function absolute(path = '/') {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Titles carry the brand unless they already do, because a searcher scanning results needs to see
 * whose page it is; the brand goes last so the keyword is what gets read first.
 */
export function withBrand(title) {
  if (!title) return SITE.name
  return title.includes(SITE.shortName) ? title : `${title} | ${SITE.name}`
}

/** Pages nobody should find in a search result: private, transactional or thin. */
export const NOINDEX_PATHS = ['/admin', '/account', '/login', '/register', '/forgot-password']

/**
 * The pages behind those prefixes that a person still has to be able to open.
 *
 * They are served with noindex rather than left out of the build: a path with no file of its own is a
 * 404 once nginx stops answering unknown paths with the app, and "sign in" is not a path to break in
 * order to tidy up a sitemap.
 */
export const PRIVATE_PAGE_SEO = {
  '/login': {
    title: 'Sign in',
    description: 'Sign in to your PrathibhaLanka account to follow a booking or write to your consultant.',
    noindex: true,
  },
  '/register': {
    title: 'Create an account',
    description: 'Create a PrathibhaLanka account to keep your enquiries, bookings and PIN in one place.',
    noindex: true,
  },
  '/forgot-password': {
    title: 'Reset your password',
    description: 'Ask for a one-time code by email and set a new password for your PrathibhaLanka account.',
    noindex: true,
  },
  '/account': {
    title: 'Your account',
    description: 'Your PrathibhaLanka enquiries and bookings.',
    noindex: true,
  },
}

/**
 * Static routes. Routes with a dynamic segment (/journeys/:id, /journal/:id) are deliberately absent:
 * their pages have the real title in hand and call useSeo themselves, and two writers for one route
 * would fight over the tag.
 */
export const PAGE_SEO = {
  '/': {
    title: 'Private Sri Lanka Tours & Tailor-Made Journeys',
    description:
      'Private tours of Sri Lanka built by a local agency: your own driver-guide, hand-planned routes and no group coaches. Cultural triangle, wildlife, tea country and coast.',
  },
  '/journeys': {
    title: 'Sri Lanka Tour Packages & Private Itineraries, 5–20 Days',
    description:
      'Browse private Sri Lanka tour packages from 5 to 20 days: the cultural triangle, Yala and Wilpattu safaris, the Kandy–Ella tea line, the east coast and the north.',
  },
  '/plan': {
    title: 'Plan Your Tailor-Made Sri Lanka Tour',
    description:
      'Tell us your dates, your pace and what you want to see, and a consultant replies with a draft Sri Lanka itinerary and a price - usually within one working day.',
  },
  '/journal': {
    title: 'Sri Lanka Travel Journal: Seasons, Routes and Places',
    description:
      'Guides from a Sri Lankan travel agency: the best time to visit, how many days you need, season-by-season weather, the Kandy to Ella train and what a safari is really like.',
  },
  '/gallery': {
    title: 'Sri Lanka Photo Gallery: Coast, Hills and Wildlife',
    description:
      'Photographs from our journeys across Sri Lanka - Sigiriya at dawn, the tea country by rail, leopards in Yala, temple mornings and the southern coast at sunset.',
  },
  '/reviews': {
    title: 'Traveller Reviews',
    description:
      'What travellers say about their private journeys with PrathibhaLanka Voyages, from the first enquiry to the last morning.',
  },
  '/about': {
    title: 'A Sri Lankan Tour Operator, Based in Kurunegala',
    description:
      'PrathibhaLanka Voyages is a small Sri Lankan tour operator arranging private, tailor-made journeys since 2014 - one consultant per trip, guides who live here.',
  },
  '/contact': {
    title: 'Contact a Sri Lanka Travel Specialist',
    description:
      'Talk to a Sri Lankan travel specialist about your dates and route. Email, WhatsApp or the enquiry form, answered by the person who plans your journey.',
  },
}

/** The 404 page: a real page for a human, but not something to rank. */
export const NOT_FOUND_SEO = {
  title: 'Page not found',
  description: 'That page does not exist. Browse our private Sri Lanka journeys instead.',
  noindex: true,
}

/** Default description for a route with no entry above, so no page is ever left without one. */
export const DEFAULT_SEO = {
  title: SITE.name,
  description: `${SITE.tagline}. Cultural triangle, wildlife safaris, hill country and the southern coast.`,
}

/**
 * Writes the head tags. Called by useSeo (pages) and RouteSeo (static routes) - one implementation,
 * so a tag can never be set two different ways in two files.
 */
export function applySeo({ title, description, path, noindex = false, type = 'website', image, jsonLd } = {}) {
  if (typeof document === 'undefined') return

  const canonical = absolute(path ?? window.location.pathname)
  const fullTitle = withBrand(title ?? DEFAULT_SEO.title)
  const desc = (description ?? DEFAULT_SEO.description).replace(/\s+/g, ' ').trim()
  const shareImage = image ? (image.startsWith('http') ? image : absolute(image)) : `${SITE_URL}/images/sl/share.jpg`

  document.title = fullTitle
  upsertMeta('name', 'description', desc)
  upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
  upsertLink('canonical', canonical)

  upsertMeta('property', 'og:type', type)
  upsertMeta('property', 'og:site_name', SITE.name)
  upsertMeta('property', 'og:url', canonical)
  upsertMeta('property', 'og:title', fullTitle)
  upsertMeta('property', 'og:description', desc)
  upsertMeta('property', 'og:image', shareImage)
  upsertMeta('property', 'og:image:width', '1200')
  upsertMeta('property', 'og:image:height', '630')

  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', fullTitle)
  upsertMeta('name', 'twitter:description', desc)
  upsertMeta('name', 'twitter:image', shareImage)

  applyJsonLd(jsonLd)
}

function upsertMeta(attr, key, content) {
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function upsertLink(rel, href) {
  let tag = document.head.querySelector(`link[rel="${rel}"]`)
  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', rel)
    document.head.appendChild(tag)
  }
  tag.setAttribute('href', href)
}

/** Replaces this page's structured data and leaves anything else (the site-wide graph) alone. */
function applyJsonLd(jsonLd) {
  document.head.querySelectorAll('script[data-seo-page]').forEach((node) => node.remove())
  if (!jsonLd) return
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.setAttribute('data-seo-page', 'true')
  script.textContent = JSON.stringify(jsonLd)
  document.head.appendChild(script)
}

/** First sentence, for a description built out of body copy. */
export function firstSentence(text, limit = 155) {
  if (!text) return ''
  const flat = text.replace(/\s+/g, ' ').trim()
  const stop = flat.search(/[.!?](\s|$)/)
  const sentence = stop === -1 ? flat : flat.slice(0, stop + 1)
  return sentence.length <= limit ? sentence : `${sentence.slice(0, limit - 1).trimEnd()}…`
}

/**
 * A journey's title and description.
 *
 * The heading is built from the length and the theme rather than the internal name, because that is
 * what people search for: "5-Day Cultural Triangle Tour of Sri Lanka", not "Pearl Trail". The name
 * stays on the page as the eyebrow, which is also what the agency's own keyword doc recommends.
 */
export function journeyHeading(pkg) {
  const days = pkg?.durationDays
  const theme = (pkg?.destination ?? '').trim()
  if (!days) return pkg?.title ?? 'Sri Lanka journey'
  const dayLabel = `${days}-Day`
  return theme
    ? `${dayLabel} ${theme} Tour of Sri Lanka`
    : `${dayLabel} Private Tour of Sri Lanka`
}

export function journeySeo(pkg) {
  if (!pkg) return { ...DEFAULT_SEO, noindex: false }
  return {
    title: `${journeyHeading(pkg)} — ${pkg.title}`,
    description: firstSentence(pkg.description) || DEFAULT_SEO.description,
    type: 'article',
    image: pkg.imageUrl || undefined,
  }
}

/** A journal post. Dates matter here: a search result with a date is read as maintained. */
export function articleSeo(post) {
  if (!post) return { ...DEFAULT_SEO, noindex: false }
  return {
    title: post.title,
    description: firstSentence(post.description ?? post.content),
    type: 'article',
    image: post.coverImageUrl || undefined,
  }
}

/** Site-wide structured data: who the business is, where it is, and what it does. */
export function organisationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${SITE_URL}/#organisation`,
    name: SITE.name,
    url: SITE_URL,
    description: `${SITE.tagline} - private, tailor-made itineraries with a local driver-guide.`,
    image: `${SITE_URL}/images/sl/share.jpg`,
    telephone: SITE.telephone,
    address: { '@type': 'PostalAddress', ...SITE.address },
    areaServed: { '@type': 'Country', name: 'Sri Lanka' },
    sameAs: SITE.sameAs,
  }
}

/** One journey, as a trip rather than a product: this is a service, not a thing in a box. */
export function journeyJsonLd(pkg) {
  if (!pkg) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: journeyHeading(pkg),
    alternateName: pkg.title,
    description: firstSentence(pkg.longDescription ?? pkg.description, 300),
    url: absolute(`/journeys/${pkg.packageId}`),
    ...(pkg.imageUrl ? { image: absolute(pkg.imageUrl) } : {}),
    ...(pkg.durationDays
      ? { itinerary: { '@type': 'ItemList', numberOfItems: pkg.durationDays } }
      : {}),
    provider: { '@id': `${SITE_URL}/#organisation` },
  }
}

/** A journal post. */
export function articleJsonLd(post) {
  if (!post) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: firstSentence(post.description ?? post.content, 300),
    url: absolute(`/journal/${post.journalId}`),
    ...(post.coverImageUrl ? { image: absolute(post.coverImageUrl) } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    author: { '@id': `${SITE_URL}/#organisation` },
    publisher: { '@id': `${SITE_URL}/#organisation` },
  }
}

/**
 * The trail shown in a search result instead of a bare URL: Journeys › Pearl Trail.
 *
 * @param {{label: string, to?: string}[]} trail in order, the last one being the current page
 */
export function breadcrumbJsonLd(trail = []) {
  const items = trail.filter(Boolean)
  if (items.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      ...(crumb.to ? { item: absolute(crumb.to) } : {}),
    })),
  }
}

/**
 * One JSON-LD block holding several things, which is what a page with a breadcrumb needs: Google
 * reads a @graph of nodes from a single script tag, and two script tags carrying @context each is
 * just more bytes for the same result.
 */
export function seoGraph(...nodes) {
  const flat = nodes.flat().filter(Boolean)
  if (flat.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@graph': flat.map(({ '@context': _drop, ...rest }) => rest),
  }
}
