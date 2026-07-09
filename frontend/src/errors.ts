// Shared helper for turning a failed fetch Response into a readable message.
// It looks for a message the backend sent (as plain text, or in a JSON
// { detail | message | error } field) and falls back to a provided default.
// Kept in one place so the dashboards don't each repeat the same code.
export async function getErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const contentType = response.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      const data = await response.json()

      if (typeof data === 'string' && data.trim() !== '') {
        return data
      }

      if (typeof data.detail === 'string' && data.detail.trim() !== '') {
        return data.detail
      }

      if (typeof data.message === 'string' && data.message.trim() !== '') {
        return data.message
      }

      if (typeof data.error === 'string' && data.error.trim() !== '') {
        return data.error
      }

      return fallbackMessage
    }

    const text = await response.text()

    if (text.trim() !== '') {
      return text
    }

    return fallbackMessage
  } catch {
    return fallbackMessage
  }
}
