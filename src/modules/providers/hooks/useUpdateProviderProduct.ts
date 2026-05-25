import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryClient } from '../../../config/query.client'
import { providersService } from '../services/providers.service'
import type { UpdateProviderProductDto } from '../types/providers.types'

export function useUpdateProviderProduct(providerId: number, code: string) {
  return useMutation({
    mutationFn: (dto: UpdateProviderProductDto) => providersService.updateProduct(providerId, code, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers', providerId, 'products'] })
      toast.success('Producto actualizado')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Error al actualizar el producto')
    },
  })
}
