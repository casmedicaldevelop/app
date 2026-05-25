import { create } from 'zustand'
import type { AuthState, User } from './types/auth.types'

const TOKEN_KEY = 'cas_access_token'

interface AuthStore extends AuthState {
  setAuth: (accessToken: string, user: User) => void
  setAccessToken: (token: string) => void
  setUser: (user: User) => void
  setInitialized: () => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: localStorage.getItem(TOKEN_KEY),
  isAuthenticated: false,
  isInitialized: false,
  setAuth: (accessToken, user) => {
    localStorage.setItem(TOKEN_KEY, accessToken)
    set({ accessToken, user, isAuthenticated: true })
  },
  setAccessToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token)
    set({ accessToken: token, isAuthenticated: true })
  },
  setUser: (user) => set({ user }),
  setInitialized: () => set({ isInitialized: true }),
  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ user: null, accessToken: null, isAuthenticated: false })
  },
}))
