import { useQuery } from '@tanstack/react-query'
import { productsService } from '../services/products.service'

export function useProduct(id: number) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsService.getById(id),
    enabled: !!id,
    staleTime: 30_000,
  })
}
