import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryClient } from '../../../config/query.client'
import { providersService } from '../services/providers.service'
import type { UpdateProviderDto } from '../types/providers.types'

export function useUpdateProvider(id: number) {
  return useMutation({
    mutationFn: (dto: UpdateProviderDto) => providersService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      toast.success('Proveedor actualizado correctamente')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Error al actualizar el proveedor')
    },
  })
}
