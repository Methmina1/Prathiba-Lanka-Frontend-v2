import { useEffect, useState } from 'react'

/**
 * Loads data from the API but never leaves the page empty: until the request resolves, and if it
 * fails (backend not running, empty table), the provided fallback content is rendered instead.
 *
 * status: 'loading' | 'live' | 'fallback'
 */
export function useApi(loader, fallback = [], deps = []) {
  const [data, setData] = useState(fallback)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let active = true

    loader()
      .then((result) => {
        if (!active) return
        const hasRows = Array.isArray(result) && result.length > 0
        setData(hasRows ? result : fallback)
        setStatus(hasRows ? 'live' : 'fallback')
      })
      .catch(() => {
        if (!active) return
        setData(fallback)
        setStatus('fallback')
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, status }
}
