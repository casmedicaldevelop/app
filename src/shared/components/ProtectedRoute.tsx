import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../modules/auth/auth.store'
import PageSpinner from './PageSpinner'

export default function ProtectedRoute() {
  const { isAuthenticated, isInitialized, user } = useAuthStore()
  const location = useLocation()

  if (!isInitialized) return <PageSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  const isChangePasswordRoute = location.pathname === '/auth/change-password'
  if (user?.mustChangePassword && !isChangePasswordRoute) {
    return <Navigate to="/auth/change-password" replace />
  }

  return <Outlet />
}
