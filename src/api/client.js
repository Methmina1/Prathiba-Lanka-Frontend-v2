/**
 * Thin wrapper around the Spring Boot API.
 * Set VITE_API_BASE_URL to point at another environment; the default matches the backend's
 * default port, which already whitelists http://localhost:5173 in its CORS configuration.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

async function request(path, { timeoutMs = 6000, ...options } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
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
  getPackages: () => request('/api/packages'),
  getGallery: () => request('/api/gallery'),
  getPublishedJournal: () => request('/api/journal/published'),
  getReviews: () => request('/api/reviews'),
  trackBooking: (pin) => request(`/api/bookings/track?pin=${encodeURIComponent(pin)}`),
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (payload) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  submitQuery: (payload) => request('/api/contact', { method: 'POST', body: JSON.stringify(payload) }),
  requestBooking: (payload, token) =>
    request('/api/bookings/request', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
}
