// Shared helper for talking to the backend.
// This keeps the base URL and the auth token in ONE place, so the
// dashboards don't each repeat the same fetch + header code.

// The backend base URL can be set with a Vite env var (VITE_API_BASE_URL).
// When it is not set (e.g. normal local development) we fall back to the
// same localhost URL as before, so nothing changes when running locally.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

// Build the headers for a request.
// We always attach the JWT token (if we have one) so the backend knows who we are.
// When we send a body (POST/PUT) we also say it is JSON.
function buildHeaders(hasBody: boolean) {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {}

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  if (hasBody) {
    headers['Content-Type'] = 'application/json'
  }

  return headers
}

// Each function returns the raw fetch Response (a Promise), so calling code
// can still use response.ok, response.status, and response.json() as before.

export function apiGet(path: string) {
  return fetch(`${API_BASE_URL}${path}`, {
    headers: buildHeaders(false),
  })
}

export function apiPost(path: string, body: unknown) {
  return fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  })
}

export function apiPut(path: string, body: unknown) {
  return fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  })
}

export function apiDelete(path: string) {
  return fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(false),
  })
}
