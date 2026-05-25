import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { serviceUsersService } from '../services/service-users.service'
import type { CreateServiceUserPayload } from '../types/service-user.types'

export function useCreateServiceUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateServiceUserPayload) => serviceUsersService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-users'] })
      toast.success('Usuario creado correctamente')
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message ?? 'Error al crear el usuario'
      toast.error(msg)
    },
  })
}
