import { useEffect, useState } from 'react'

/** Turns a fetch error into something a person can act on. */
export function describeError(error) {
  if (!error) return 'Something went wrong.'
  if (error.status === 401) return 'Your session has expired. Sign in again to continue.'
  if (error.status === 403) return 'This account does not have admin access.'
  if (error.status === 404) return 'That record no longer exists.'
  if (error.status === 409) return error.payload?.message ?? 'That conflicts with existing data.'
  if (error.status === 400) return error.payload?.message ?? 'Please check the form and try again.'
  if (error.status) return error.payload?.message ?? `Request failed (${error.status}).`
  return 'Cannot reach the backend - is it running on port 8080?'
}

/**
 * Loads a list for an admin screen and can be re-run after a mutation.
 * `deps` behaves like a normal dependency list.
 */
export function useAdminList(load, deps = []) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let active = true

    setLoading(true)
    setError('')

    load()
      .then((data) => {
        if (active) setRows(Array.isArray(data) ? data : [])
      })
      .catch((problem) => {
        if (active) setError(describeError(problem))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { rows, setRows, loading, error, reload: () => setTick((value) => value + 1) }
}
