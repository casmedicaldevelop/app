import { Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'

import LandingLayout from '@/shared/layouts/LandingLayout'
import AuthLayout from '@/shared/layouts/AuthLayout'
import DashboardLayout from '@/shared/layouts/DashboardLayout'
import ProtectedRoute from '@/shared/components/ProtectedRoute'
import PublicOnlyRoute from '@/shared/components/PublicOnlyRoute'
import AdminRoute from '@/shared/components/AdminRoute'
import ModuleNotReady from '@/shared/components/ModuleNotReady'

import LandingPage from '@/modules/landing/screens/landing'
import LoginPage from '@/modules/auth/screens/login'
import ForgotPasswordPage from '@/modules/auth/screens/forgot-password'
import ResetPasswordPage from '@/modules/auth/screens/reset-password'
import ChangePasswordPage from '@/modules/auth/screens/change-password'
import InicioDashboardPage from '@/modules/dashboard/screens/inicio'
import StaffListPage from '@/modules/employees/screens/staff-list'
import StaffDetailPage from '@/modules/employees/screens/staff-detail'
import StaffCreatePage from '@/modules/employees/screens/staff-create'
import ModulesListPage from '@/modules/system-modules/screens/modules-list'
import ModuleCreatePage from '@/modules/system-modules/screens/module-create'
import ModuleEditPage from '@/modules/system-modules/screens/module-edit'
import ProductsListPage from '@/modules/products/screens/products-list'
import ProductCreatePage from '@/modules/products/screens/product-create'
import ProductEditPage from '@/modules/products/screens/product-edit'
import CumMatchingProvider1Page from '@/modules/products/screens/cum-matching-provider1'
import ProvidersListPage from '@/modules/providers/screens/providers-list'
import ProviderDetailPage from '@/modules/providers/screens/provider-detail'
import ServiceUsersListPage from '@/modules/users/screens/service-users-list'
import ServiceUserCreatePage from '@/modules/users/screens/service-user-create'
import ServiceUserEditPage from '@/modules/users/screens/service-user-edit'
import CompanyPage from '@/modules/company/screens/company'
import StopMaxListPage from '@/modules/stop-max/screens/stop-max-list'
import StopMaxCreatePage from '@/modules/stop-max/screens/stop-max-create'
import StopMaxEditPage from '@/modules/stop-max/screens/stop-max-edit'
import MipresPage from '@/modules/mipres/screens/mipres-page'
import TvMedListPage from '@/modules/tv-med/screens/tv-med-list'
import TvMedCreatePage from '@/modules/tv-med/screens/tv-med-create'
import TvMedEditPage from '@/modules/tv-med/screens/tv-med-edit'

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
          { path: '/auth/forgot-password', element: <ForgotPasswordPage /> },
          { path: '/auth/reset-password', element: <ResetPasswordPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/auth/change-password', element: <ChangePasswordPage /> },
        ],
      },
      {
        element: <DashboardLayout />,
        children: [
          { path: '/dashboard', element: <Navigate to="/dashboard/inicio" replace /> },
          { path: '/dashboard/inicio', element: <InicioDashboardPage /> },
          { path: '/dashboard/dashboard', element: <InicioDashboardPage /> },
          {
            element: <AdminRoute />,
            children: [
              { path: '/dashboard/employees', element: <StaffListPage /> },
              { path: '/dashboard/employees/nuevo', element: <StaffCreatePage /> },
              { path: '/dashboard/employees/:id', element: <StaffDetailPage /> },
              { path: '/dashboard/modules', element: <ModulesListPage /> },
              { path: '/dashboard/modules/new', element: <ModuleCreatePage /> },
              { path: '/dashboard/modules/:id/edit', element: <ModuleEditPage /> },
              { path: '/dashboard/company', element: <CompanyPage /> },
            ],
          },
          { path: '/dashboard/products', element: <ProductsListPage /> },
          { path: '/dashboard/products/new', element: <ProductCreatePage /> },
          { path: '/dashboard/products/cum-matching/provider1', element: <CumMatchingProvider1Page /> },
          { path: '/dashboard/products/:id/edit', element: <ProductEditPage /> },
          { path: '/dashboard/providers', element: <ProvidersListPage /> },
          { path: '/dashboard/providers/:id', element: <ProviderDetailPage /> },
          { path: '/dashboard/usuarios', element: <ServiceUsersListPage /> },
          { path: '/dashboard/usuarios/nuevo', element: <ServiceUserCreatePage /> },
          { path: '/dashboard/usuarios/:id/editar', element: <ServiceUserEditPage /> },
          { path: '/dashboard/stop-max', element: <StopMaxListPage /> },
          { path: '/dashboard/stop-max/new', element: <StopMaxCreatePage /> },
          { path: '/dashboard/stop-max/:id/edit', element: <StopMaxEditPage /> },
          { path: '/dashboard/tv-med', element: <TvMedListPage /> },
          { path: '/dashboard/tv-med/new', element: <TvMedCreatePage /> },
          { path: '/dashboard/tv-med/:id/edit', element: <TvMedEditPage /> },
          { path: '/dashboard/mipres', element: <MipresPage /> },
          { path: '/dashboard/*', element: <ModuleNotReady /> },
        ],
      },
    ],
  },
]
