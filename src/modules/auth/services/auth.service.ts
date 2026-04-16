import { apiConfig } from '../../../config/api.config'
import type { LoginRequest, TokenPair } from '../types/auth.types'

const base = apiConfig.baseUrl

export const authService = {
  login: async (credentials: LoginRequest): Promise<TokenPair> => {
    const res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    if (!res.ok) throw await res.json()
    return res.json()
  },

  refresh: async (refreshToken: string): Promise<TokenPair> => {
    const res = await fetch(`${base}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) throw await res.json()
    return res.json()
  },

  logout: async (): Promise<void> => {
    await fetch(`${base}/auth/logout`, { method: 'POST' })
  },
}
