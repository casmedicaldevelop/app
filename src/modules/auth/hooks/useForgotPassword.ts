import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '../services/auth.service'

export function useForgotPassword() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: (_data, email) => {
      toast.info('Si el email existe, recibirás un código en los próximos minutos.')
      navigate(`/auth/reset-password?email=${encodeURIComponent(email)}`)
    },
    onError: (_err, email) => {
      toast.info('Si el email existe, recibirás un código en los próximos minutos.')
      navigate(`/auth/reset-password?email=${encodeURIComponent(email)}`)
    },
  })
}
