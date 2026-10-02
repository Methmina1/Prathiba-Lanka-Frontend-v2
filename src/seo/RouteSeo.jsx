import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  DEFAULT_SEO,
  NOINDEX_PATHS,
  NOT_FOUND_SEO,
  PAGE_SEO,
  PRIVATE_PAGE_SEO,
  applySeo,
  organisationJsonLd,
} from './seo'

/**
 * The head tags for the static routes, applied from the current URL.
 *
 * Mounted once, inside the router. It covers the pages that hold no data of their own - Home,
 * /journeys, /about, /contact and the rest - and deliberately does not cover the two detail routes
 * (/journeys/:id, /journal/:id), whose pages set their own title from the record they loaded.
 *
 * Anything under a private prefix gets noindex: the console, the account area and the two
 * transactional pages have nothing to offer a search result, and the console is already disallowed in
 * robots.txt.
 */
export default function RouteSeo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const path = pathname.replace(/\/+$/, '') || '/'

    if (NOINDEX_PATHS.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
      applySeo({ ...(PRIVATE_PAGE_SEO[path] ?? DEFAULT_SEO), path, noindex: true })
      return
    }

    const entry = PAGE_SEO[path]
    if (entry) {
      // The homepage also carries the business's structured data; other pages inherit the graph
      // through the @id references inside their own JSON-LD.
      applySeo({
        ...entry,
        path,
        jsonLd: path === '/' ? { '@context': 'https://schema.org', '@graph': [organisationJsonLd()] } : undefined,
      })
      return
    }

    // A dynamic route whose page sets its own tags, or a path that is not a page at all. Either way
    // the canonical is this path and not the homepage, which is the part that was actively wrong.
    if (/^\/(journeys|journal)\/[^/]+$/.test(path) || /^\/enquiry\/[^/]+$/.test(path)) {
      applySeo({ ...DEFAULT_SEO, path, noindex: path.startsWith('/enquiry') })
      return
    }

    applySeo({ ...NOT_FOUND_SEO, path })
  }, [pathname])

  return null
}
