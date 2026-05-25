export function tryParseSisproErrors(message: string): string | null {
  // SISPRO surfaces errors as JSON: {"Message":"ID: X","Errors":["..."]}
  // The backend forwards the body verbatim inside BadRequestException, so it
  // arrives here as a string. Surface only the human-readable Errors[] array.
  const trimmed = message.trim()
  if (!trimmed.startsWith('{') || !trimmed.includes('Errors')) return null
  try {
    const parsed = JSON.parse(trimmed) as { Errors?: unknown; Message?: unknown }
    if (Array.isArray(parsed.Errors) && parsed.Errors.length > 0) {
      return parsed.Errors.filter((e): e is string => typeof e === 'string').join('. ')
    }
    if (typeof parsed.Message === 'string' && parsed.Message.trim()) return parsed.Message
  } catch {
    return null
  }
  return null
}

export function extractMessage(err: unknown): string {
  let raw: string | null = null
  if (err instanceof Error) raw = err.message
  else if (typeof err === 'object' && err !== null) {
    const e = err as { message?: unknown }
    if (typeof e.message === 'string') raw = e.message
    else if (Array.isArray(e.message)) raw = (e.message as string[]).join(', ')
  }
  if (!raw) return 'Connection error'
  return tryParseSisproErrors(raw) ?? raw
}
