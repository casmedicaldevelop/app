import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../modules/auth/auth.store'

export default function AdminRoute() {
  const { user } = useAuthStore()
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard/inicio" replace />
  return <Outlet />
}
