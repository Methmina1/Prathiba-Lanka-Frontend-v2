import { useEffect } from 'react'
import { applySeo } from './seo'

/**
 * Gives a page its own title, description and canonical URL.
 *
 * A page with data in hand (a journey, a journal post) passes the values itself, because only that
 * page knows them. Static routes do not call this at all - RouteSeo covers those from one map, and
 * one writer per route is the rule: two components setting the same tag means whichever runs last
 * wins, which is a bug that looks like a caching problem.
 *
 *   useSeo(journeySeo(pkg))
 *   useSeo({ ...articleSeo(post), jsonLd: articleJsonLd(post) })
 *
 * Called unconditionally at the top of a component, before any early return, like any other hook.
 */
export function useSeo(seo) {
  const { title, description, path, noindex, type, image, jsonLd } = seo ?? {}

  useEffect(() => {
    applySeo({ title, description, path, noindex, type, image, jsonLd })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, noindex, type, image, JSON.stringify(jsonLd ?? null)])
}
