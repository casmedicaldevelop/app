import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { serviceUsersService } from '../services/service-users.service'

export function useToggleServiceUser(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isActive: boolean) => serviceUsersService.update(id, { isActive }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['service-users'] })
      toast.success(updated.isActive ? 'Usuario activado' : 'Usuario desactivado')
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message ?? 'Error al cambiar el estado'
      toast.error(msg)
    },
  })
}
