// Shared helper for talking to the backend.
// This keeps the base URL and the auth token in ONE place, so the
// dashboards don't each repeat the same fetch + header code.

const BASE_URL = 'http://localhost:8080'

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
  return fetch(`${BASE_URL}${path}`, {
    headers: buildHeaders(false),
  })
}

export function apiPost(path: string, body: unknown) {
  return fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  })
}

export function apiPut(path: string, body: unknown) {
  return fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  })
}

export function apiDelete(path: string) {
  return fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(false),
  })
}
