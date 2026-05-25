import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productsService } from '../services/products.service'
import type { CreateProductPayload } from '../types/products.types'

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProductPayload) => productsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Producto creado correctamente')
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message ?? 'Error al crear el producto'
      toast.error(msg)
    },
  })
}
