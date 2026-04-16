import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './config/query.client'

import LandingLayout from './shared/components/layouts/LandingLayout'
import AuthLayout from './shared/components/layouts/AuthLayout'
import DashboardLayout from './shared/components/layouts/DashboardLayout'
import ProtectedRoute from './shared/components/ProtectedRoute'
import PublicOnlyRoute from './shared/components/PublicOnlyRoute'

import LandingPage from './modules/landing/screens/landing'
import LoginPage from './modules/auth/screens/login'
import InicioDashboardPage from './modules/dashboard/screens/inicio'
import ClienteListPage from './modules/clientes/screens/clienteList'
import ClienteDetailPage from './modules/clientes/screens/clienteDetail'
import PedidoListPage from './modules/pedidos/screens/pedidoList'
import PedidoDetailPage from './modules/pedidos/screens/pedidoDetail'
import ProductoListPage from './modules/productos/screens/productoList'
import ReportesPage from './modules/reportes/screens/reportes'
import UsuariosPage from './modules/usuarios/screens/usuarios'
import ConfiguracionPage from './modules/configuracion/screens/configuracion'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public — landing */}
          <Route element={<LandingLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          {/* Public only — redirect if authenticated */}
          <Route element={<PublicOnlyRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>
          </Route>

          {/* Protected — dashboard */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Navigate to="/dashboard/inicio" replace />} />
              <Route path="/dashboard/inicio" element={<InicioDashboardPage />} />
              <Route path="/dashboard/clientes" element={<ClienteListPage />} />
              <Route path="/dashboard/clientes/:id" element={<ClienteDetailPage />} />
              <Route path="/dashboard/pedidos" element={<PedidoListPage />} />
              <Route path="/dashboard/pedidos/:id" element={<PedidoDetailPage />} />
              <Route path="/dashboard/productos" element={<ProductoListPage />} />
              <Route path="/dashboard/reportes" element={<ReportesPage />} />
              <Route path="/dashboard/usuarios" element={<UsuariosPage />} />
              <Route path="/dashboard/configuracion" element={<ConfiguracionPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
