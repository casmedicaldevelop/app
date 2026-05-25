import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { serviceUsersService } from '../services/service-users.service'
import type { UpdateServiceUserPayload } from '../types/service-user.types'

export function useUpdateServiceUser(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateServiceUserPayload) => serviceUsersService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-users'] })
      toast.success('Usuario actualizado correctamente')
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message ?? 'Error al actualizar el usuario'
      toast.error(msg)
    },
  })
}
