import { useAuthStore } from '../auth.store'
import { authService } from '../services/auth.service'
import type { LoginRequest } from '../types/auth.types'

export function useLogin() {
  const { setAccessToken } = useAuthStore()

  const login = async (credentials: LoginRequest) => {
    const { accessToken, refreshToken } = await authService.login(credentials)
    localStorage.setItem('refreshToken', refreshToken)
    setAccessToken(accessToken)
    // TODO: decode user from token or fetch /auth/me
  }

  return { login }
}
