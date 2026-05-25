import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/auth.service'

export function useVerifyOtp(email: string) {
  return useMutation({
    mutationFn: (otp: string) => authService.verifyOtp(email, otp),
  })
}
