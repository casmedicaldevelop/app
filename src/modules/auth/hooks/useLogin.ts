import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../auth.store'
import { authService } from '../services/auth.service'
import type { LoginRequest } from '../types/auth.types'

export function useLogin() {
  const { setAccessToken, setUser } = useAuthStore()
  const navigate = useNavigate()

  const login = async (credentials: LoginRequest) => {
    const { accessToken } = await authService.login(credentials)
    setAccessToken(accessToken)

    const user = await authService.me(accessToken)
    setUser(user)

    if (user.mustChangePassword) {
      navigate('/auth/change-password', { replace: true })
    } else {
      navigate('/dashboard/inicio', { replace: true })
    }
  }

  return { login }
}
