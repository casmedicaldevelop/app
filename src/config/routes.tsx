import { Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'

import LandingLayout from '@/shared/layouts/LandingLayout'
import AuthLayout from '@/shared/layouts/AuthLayout'
import DashboardLayout from '@/shared/layouts/DashboardLayout'
import ProtectedRoute from '@/shared/components/ProtectedRoute'
import PublicOnlyRoute from '@/shared/components/PublicOnlyRoute'

import LandingPage from '@/modules/landing/screens/landing'
import LoginPage from '@/modules/auth/screens/login'
import InicioDashboardPage from '@/modules/dashboard/screens/inicio'

export const routes: RouteObject[] = [
  {
    element: <LandingLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
    ],
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/dashboard', element: <Navigate to="/dashboard/inicio" replace /> },
          { path: '/dashboard/inicio', element: <InicioDashboardPage /> },
        ],
      },
    ],
  },
]
