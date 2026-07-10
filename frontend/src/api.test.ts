import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiGet, apiPost } from './api'

// A minimal stand-in for the parts of Response the calling code reads.
function fakeResponse(
  body: unknown,
  init: { ok?: boolean; status?: number } = {}
): Response {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  } as unknown as Response
}

describe('api.ts', () => {
  let fetchMock: ReturnType<typeof vi.fn>
  let store: Record<string, string>

  beforeEach(() => {
    // Fresh in-memory localStorage for every test.
    store = {}
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => (key in store ? store[key] : null),
      setItem: (key: string, value: string) => {
        store[key] = value
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        store = {}
      },
    })

    // Mocked fetch so no real network request is made.
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('uses the default base URL when VITE_API_BASE_URL is not set', () => {
    fetchMock.mockResolvedValue(fakeResponse({}))

    apiGet('/courses')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('http://localhost:8080/courses')
  })

  it('sends an Authorization Bearer header when a token exists', () => {
    store['token'] = 'test-token-123'
    fetchMock.mockResolvedValue(fakeResponse({}))

    apiGet('/courses')

    const options = fetchMock.mock.calls[0][1] as RequestInit
    const headers = options.headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer test-token-123')
  })

  it('omits the Authorization header when no token exists', () => {
    fetchMock.mockResolvedValue(fakeResponse({}))

    apiGet('/courses')

    const options = fetchMock.mock.calls[0][1] as RequestInit
    const headers = options.headers as Record<string, string>
    expect(headers['Authorization']).toBeUndefined()
  })

  it('returns the response so a JSON success body can be read', async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({ id: 1, title: 'Intro to React' }, { ok: true, status: 200 })
    )

    const response = await apiGet('/courses/1')

    expect(response.ok).toBe(true)
    expect(await response.json()).toEqual({ id: 1, title: 'Intro to React' })
  })

  it('passes failed responses through so backend error messages can be read', async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({ message: 'Course not found.' }, { ok: false, status: 404 })
    )

    const response = await apiPost('/courses', { title: '' })

    // The request is sent as JSON with the correct method...
    const options = fetchMock.mock.calls[0][1] as RequestInit
    expect(options.method).toBe('POST')
    const headers = options.headers as Record<string, string>
    expect(headers['Content-Type']).toBe('application/json')

    // ...and the raw response is returned so the caller can read the error body.
    expect(response.ok).toBe(false)
    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ message: 'Course not found.' })
  })
})
