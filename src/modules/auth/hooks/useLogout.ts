import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../auth.store'

export function useLogout() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  return async () => {
    try {
      await authService.logout()
    } catch {
      // API errors on logout are non-blocking — still clear local state
    } finally {
      logout()
      navigate('/login', { replace: true })
    }
  }
}
