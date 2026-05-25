import { useQuery } from '@tanstack/react-query'
import { productsService } from '../services/products.service'
import type { ListProductsParams } from '../types/products.types'

export function useProducts(params: ListProductsParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsService.list(params),
    staleTime: 30_000,
  })
}
