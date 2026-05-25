import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productsService } from '../services/products.service'

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => productsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Producto eliminado correctamente')
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message ?? 'Error al eliminar el producto'
      toast.error(msg)
    },
  })
}
