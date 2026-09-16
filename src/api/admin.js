import { request } from './client'

/**
 * Every endpoint the admin area uses. Each call takes the admin's bearer token; the backend
 * enforces ROLE_ADMIN on /api/admin/** regardless of what the UI does.
 */
const auth = (token) => ({ Authorization: `Bearer ${token}` })
const json = (token, body) => ({ headers: auth(token), body: JSON.stringify(body) })

export const adminApi = {
  // ---- packages -----------------------------------------------------------
  listPackages: (token) => request('/api/admin/packages', { headers: auth(token) }),
  createPackage: (token, body) => request('/api/admin/packages', { method: 'POST', ...json(token, body) }),
  updatePackage: (token, id, body) =>
    request(`/api/admin/packages/${id}`, { method: 'PUT', ...json(token, body) }),
  deactivatePackage: (token, id) =>
    request(`/api/admin/packages/${id}/deactivate`, { method: 'PATCH', headers: auth(token) }),
  deletePackage: (token, id) => request(`/api/admin/packages/${id}`, { method: 'DELETE', headers: auth(token) }),

  // ---- bookings -----------------------------------------------------------
  listBookings: (token, status) =>
    request(`/api/admin/bookings${status ? `?status=${encodeURIComponent(status)}` : ''}`, {
      headers: auth(token),
    }),
  confirmBooking: (token, id, body) =>
    request(`/api/admin/bookings/${id}/confirm`, { method: 'PATCH', ...json(token, body) }),
  rejectBooking: (token, id) =>
    request(`/api/admin/bookings/${id}/reject`, { method: 'PATCH', headers: auth(token) }),

  // ---- contact queries ----------------------------------------------------
  listQueries: (token, onlyNew) =>
    request(`/api/admin/queries${onlyNew ? '?onlyNew=true' : ''}`, { headers: auth(token) }),
  respondToQuery: (token, id, adminResponse) =>
    request(`/api/admin/queries/${id}/respond`, {
      method: 'PATCH',
      ...json(token, { adminResponse }),
    }),

  // ---- journal ------------------------------------------------------------
  listJournal: (token) => request('/api/admin/journal', { headers: auth(token) }),
  createPost: (token, body) => request('/api/admin/journal', { method: 'POST', ...json(token, body) }),
  updatePost: (token, id, body) =>
    request(`/api/admin/journal/${id}`, { method: 'PUT', ...json(token, body) }),
  publishPost: (token, id) =>
    request(`/api/admin/journal/${id}/publish`, { method: 'PATCH', headers: auth(token) }),
  unpublishPost: (token, id) =>
    request(`/api/admin/journal/${id}/unpublish`, { method: 'PATCH', headers: auth(token) }),
  deletePost: (token, id) => request(`/api/admin/journal/${id}`, { method: 'DELETE', headers: auth(token) }),

  // ---- gallery ------------------------------------------------------------
  uploadImage: (token, body) => request('/api/admin/gallery', { method: 'POST', ...json(token, body) }),
  updateImage: (token, id, body) =>
    request(`/api/admin/gallery/${id}`, { method: 'PUT', ...json(token, body) }),
  deleteImage: (token, id) => request(`/api/admin/gallery/${id}`, { method: 'DELETE', headers: auth(token) }),

  // ---- reviews (moderation) ----------------------------------------------
  deleteReview: (token, id) => request(`/api/admin/reviews/${id}`, { method: 'DELETE', headers: auth(token) }),
}
