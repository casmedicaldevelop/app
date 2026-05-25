import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useLogin } from '../useLogin'
import type { LoginRequest } from '../../types/auth.types'

export function useLoginForm() {
  const { login } = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>()

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login(data)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      if (e?.statusCode === 401) {
        toast.error('Credenciales inválidas')
      } else {
        toast.error(e?.message ?? 'Error al iniciar sesión')
      }
    }
  })

  return { register, onSubmit, errors, isSubmitting }
}
