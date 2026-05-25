import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../auth.store'
import type { ChangePasswordRequest } from '../types/auth.types'

export function useChangePassword() {
  const { setAccessToken, setUser } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) => authService.changePassword(payload),
    onSuccess: async ({ accessToken }) => {
      setAccessToken(accessToken)
      const user = await authService.me(accessToken)
      setUser(user)
      toast.success('Contraseña actualizada correctamente')
      navigate('/dashboard/inicio', { replace: true })
    },
    onError: (err: unknown) => {
      const message = (err as { message?: string })?.message ?? ''
      if (message.includes('current password')) {
        toast.error('La contraseña actual es incorrecta')
      } else {
        toast.error('Error al cambiar la contraseña')
      }
    },
  })
}
