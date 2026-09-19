import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'

const STORAGE_KEY = 'prathibalanka.session'

const AuthContext = createContext(null)

/**
 * Customer session: the JWT issued by /api/auth/login or /register, kept in localStorage so a
 * refresh does not sign you out. Reads happen in an effect, never during render, so the app still
 * renders on the server.
 *
 * `initialSession` exists for tests and server rendering - pass a session and hydration is skipped.
 */
export function AuthProvider({ children, initialSession = null }) {
  const [session, setSession] = useState(initialSession)
  const [ready, setReady] = useState(initialSession !== null)

  useEffect(() => {
    if (initialSession !== null) {
      setReady(true)
      return
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) setSession(JSON.parse(raw))
    } catch {
      // a corrupt entry just means "signed out"
    }
    setReady(true)
  }, [initialSession])

  useEffect(() => {
    if (!ready) return
    try {
      if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      else window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // storage can be blocked; the session then lives for this tab only
    }
  }, [session, ready])

  const adopt = useCallback((data) => {
    setSession({ token: data.token, email: data.email, role: data.role, userId: data.userId })
    return data
  }, [])

  const signIn = useCallback(
    async (email, password) => adopt(await api.login(email, password)),
    [adopt]
  )

  const signUp = useCallback(async (payload) => adopt(await api.register(payload)), [adopt])

  const signOut = useCallback(() => setSession(null), [])

  const value = useMemo(
    () => ({
      session,
      ready,
      token: session?.token ?? null,
      email: session?.email ?? null,
      userId: session?.userId ?? null,
      isCustomer: session?.role === 'ROLE_CUSTOMER',
      isAdmin: session?.role === 'ROLE_ADMIN',
      /**
       * Whether this visitor may use the booking flow at all.
       *
       * An administrator may not: the backend refuses a booking request made with an admin token
       * (403 - see @PreAuthorize on BookingController), because an admin is staff rather than a
       * traveller, and the id in an admin token is not a customer id. So the site does not offer
       * them the booking pages, rather than walking them into a refusal. Guests may book - the
       * enquiry form is public.
       */
      mayBook: session?.role !== 'ROLE_ADMIN',
      signIn,
      signUp,
      signOut,
    }),
    [session, ready, signIn, signUp, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
