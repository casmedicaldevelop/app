import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../modules/auth/auth.store'

export default function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/dashboard/inicio" replace /> : <Outlet />
}
