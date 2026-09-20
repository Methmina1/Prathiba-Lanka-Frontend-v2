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
    // FormData must set its own Content-Type, otherwise the multipart boundary is lost.
    const isUpload = typeof FormData !== 'undefined' && options.body instanceof FormData
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: isUpload
        ? { ...(options.headers ?? {}) }
        : { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    })

    const text = await response.text()
    const payload = text ? JSON.parse(text) : null

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

  // editable page content (public read; the admin console writes it)
  getPageContent: (section) => request(`/api/content/${section}`),

  // customer actions (need a bearer token)
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
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
