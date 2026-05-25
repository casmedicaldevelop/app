import { useEffect } from 'react'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../auth.store'

export function useInitAuth() {
  const { setAccessToken, setUser, setInitialized, isInitialized } = useAuthStore()

  useEffect(() => {
    if (isInitialized) return

    const token = localStorage.getItem('cas_access_token')
    if (!token) {
      setInitialized()
      return
    }

    setAccessToken(token)
    authService.me(token)
      .then((user) => { setUser(user) })
      .catch(() => { useAuthStore.getState().logout() })
      .finally(() => { setInitialized() })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
