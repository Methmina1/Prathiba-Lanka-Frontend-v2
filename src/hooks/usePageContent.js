import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { PAGE_DEFAULTS, mergeDefaults } from '../data/pageContent'

/**
 * Loads an editable page section (about, contact) and merges it over the bundled copy, so a page
 * renders its defaults immediately and picks up the stored content when the backend answers.
 *
 * status: 'loading' | 'live' | 'fallback'
 */
export function usePageContent(section) {
  const fallback = PAGE_DEFAULTS[section]
  const [content, setContent] = useState(fallback)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let active = true

    api
      .getPageContent(section)
      .then((result) => {
        if (!active) return
        setContent(mergeDefaults(PAGE_DEFAULTS[section], result?.payload))
        setStatus('live')
      })
      .catch(() => {
        if (!active) return
        setContent(PAGE_DEFAULTS[section])
        setStatus('fallback')
      })

    return () => {
      active = false
    }
  }, [section])

  return { content, status }
}
