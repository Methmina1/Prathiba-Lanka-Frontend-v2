import { useEffect, useState } from 'react'

/**
 * Loads a single record (a package, a journal post ...) and reports what happened:
 *
 *   status: 'loading' | 'ready' | 'missing' | 'error'
 *
 * 'missing' is a 404 from the API, which pages render as "not found" rather than a failure.
 */
export function useResource(loader, deps = []) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })

  useEffect(() => {
    let active = true

    setState({ status: 'loading', data: null, error: null })

    loader()
      .then((data) => {
        if (!active) return
        setState(
          data
            ? { status: 'ready', data, error: null }
            : { status: 'missing', data: null, error: null }
        )
      })
      .catch((error) => {
        if (!active) return
        setState({
          status: error?.status === 404 ? 'missing' : 'error',
          data: null,
          error,
        })
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
