import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productsService } from '../services/products.service'

export function useToggleProduct(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isActive: boolean) => productsService.update(id, { isActive }),
    onSuccess: (_, isActive) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(isActive ? 'Producto activado' : 'Producto desactivado')
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message ?? 'Error al cambiar estado del producto'
      toast.error(msg)
    },
  })
}
