import { useSyncExternalStore } from 'react'

export interface RequestMeta {
  url: string
  method: string
  requestHeaders: Record<string, string>
  requestBody: string | null
  status: number
  statusText: string
  responseHeaders: Record<string, string>
  responseBody: unknown
  durationMs: number
  startedAt: number
}

const store = new Map<string, RequestMeta>()
const listeners = new Set<() => void>()

export function recordRequest(key: string, meta: RequestMeta): void {
  store.set(key, meta)
  listeners.forEach((l) => l())
}

export function getRequest(key: string): RequestMeta | undefined {
  return store.get(key)
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useRequestMeta(key: string): RequestMeta | undefined {
  return useSyncExternalStore(
    subscribe,
    () => store.get(key),
    () => undefined,
  )
}
