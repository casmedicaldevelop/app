import { apiConfig } from '../../../config/api.config'
import { apiFetch } from '../../../lib/api-fetch'
import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  MeResponse,
  ResetPasswordRequest,
  VerifyOtpResponse,
} from '../types/auth.types'

const base = apiConfig.baseUrl

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw await res.json().catch(() => ({ message: res.statusText }))
  return res.json() as Promise<T>
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    })
    return parseJson<LoginResponse>(res)
  },

  async me(accessToken: string): Promise<MeResponse> {
    const res = await fetch(`${base}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return parseJson<MeResponse>(res)
  },

  async logout(): Promise<void> {
    await apiFetch('/auth/logout', { method: 'POST' })
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await fetch(`${base}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    return parseJson<{ message: string }>(res)
  },

  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    const res = await fetch(`${base}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    })
    return parseJson<VerifyOtpResponse>(res)
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<{ message: string }> {
    const res = await fetch(`${base}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return parseJson<{ message: string }>(res)
  },

  async changePassword(payload: ChangePasswordRequest): Promise<{ accessToken: string }> {
    return apiFetch<{ accessToken: string }>('/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  },
}
