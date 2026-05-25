import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productsService } from '../services/products.service'
import type { UpdateProductPayload } from '../types/products.types'

export function useUpdateProduct(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateProductPayload) => productsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Producto actualizado correctamente')
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message ?? 'Error al actualizar el producto'
      toast.error(msg)
    },
  })
}
