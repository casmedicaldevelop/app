import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from '@/config/query.client'
import { routes } from '@/config/routes'
import { useInitAuth } from '@/modules/auth/hooks/useInitAuth'
import './index.css'

function AppRoutes() {
  useInitAuth()
  return useRoutes(routes)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
