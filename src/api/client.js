/**
 * Thin wrapper around the Spring Boot API.
 * Set VITE_API_BASE_URL to point at another environment; the default matches the backend's
 * default port, which already whitelists http://localhost:5173 in its CORS configuration.
 *
 * The production image builds with VITE_API_BASE_URL=/ (or "") so every request is same-origin and
 * nginx forwards /api and /media to the backend - no CORS, and the backend's address can change
 * without rebuilding this bundle. A trailing slash is dropped so paths do not end up doubled.
 */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/+$/, '')

export async function request(path, { timeoutMs = 6000, ...options } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    // FormData must set its own Content-Type, otherwise the multipart boundary is lost. A GET has
    // no body for a Content-Type to describe, and setting it anyway turns a simple request into
    // one that needs a preflight - so it is only sent when there is something to send.
    const isUpload = typeof FormData !== 'undefined' && options.body instanceof FormData
    const hasBody = options.body != null

    const headers = isUpload
      ? { ...(options.headers ?? {}) }
      : { ...(hasBody ? { 'Content-Type': 'application/json' } : {}), ...(options.headers ?? {}) }

    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers,
    })

    const text = await response.text()
    // A proxy or load balancer answering with an HTML error page is not JSON, and a bare
    // SyntaxError from here would reach the caller with no status and no payload.
    let payload = null
    if (text) {
      try {
        payload = JSON.parse(text)
      } catch {
        payload = { message: text.slice(0, 200) }
      }
    }

    if (!response.ok) {
      const error = new Error(payload?.message ?? `Request failed with status ${response.status}`)
      error.status = response.status
      error.payload = payload
      throw error
    }
    return payload
  } finally {
    clearTimeout(timer)
  }
}

export const api = {
  baseUrl: BASE_URL,

  /**
   * Resolves a stored image reference for the browser. Uploaded files are stored as a path
   * (/media/<name>) so they survive a change of host, and the browser needs the API origin in front
   * of them - the front end is served from its own origin. Anything else (a photograph that ships
   * with the site, or a full URL) is already resolvable, so it is returned untouched.
   */
  mediaUrl: (path) => {
    if (!path) return path
    if (/^https?:\/\//i.test(path)) return path
    return path.startsWith('/media/') ? `${BASE_URL}${path}` : path
  },

  // catalogue
  getPackages: () => request('/api/packages'),
  getPackage: (id) => request(`/api/packages/${id}`),
  searchPackages: (destination) =>
    request(`/api/packages/search?destination=${encodeURIComponent(destination)}`),

  // journal, gallery, reviews
  getPublishedJournal: () => request('/api/journal/published'),
  getJournalPost: (id) => request(`/api/journal/published/${id}`),
  getGallery: () => request('/api/gallery'),
  getGalleryByPackage: (packageId) => request(`/api/gallery/package/${packageId}`),
  getReviews: () => request('/api/reviews'),
  getReviewsByPackage: (packageId) => request(`/api/reviews/package/${packageId}`),

  // public actions
  submitQuery: (payload) => request('/api/contact', { method: 'POST', body: JSON.stringify(payload) }),
  trackBooking: (pin) => request(`/api/bookings/track?pin=${encodeURIComponent(pin)}`),

  /**
   * The customer's own enquiry, opened by the token from their acknowledgement email.
   *
   * No account and no token header: the token in the URL *is* the credential, which is the same trade
   * the booking PIN makes. Reading is not rate limited, writing is (see the backend's
   * app.rate-limit.paths), so refreshing this page never answers "too many requests".
   */
  getEnquiry: (token) => request(`/api/enquiries/${encodeURIComponent(token)}`),
  sendEnquiryMessage: (token, message) =>
    request(`/api/enquiries/${encodeURIComponent(token)}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  // editable page content (public read; the admin console writes it)
  getPageContent: (section) => request(`/api/content/${section}`),

  // customer actions (need a bearer token)
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  /**
   * Admin only. Answers 401 when the address has no admin account behind it, so the caller can say
   * so rather than leaving them waiting for a mail that was never sent - see the backend's
   * AuthController for what that trade costs and why it is only tolerable while the path is rate
   * limited. The leading slash matters: BASE_URL has its trailing slash stripped.
   */
  forgotPassword: (email) =>
    request('/api/auth/password/forgot', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: ({ email, code, newPassword }) =>
    request('/api/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    }),

  register: (payload) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  getMyBookings: (token) =>
    request('/api/customer/bookings', { headers: { Authorization: `Bearer ${token}` } }),
  submitReview: (payload, token) =>
    request('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
  requestBooking: (payload, token) =>
    request('/api/bookings/request', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
}