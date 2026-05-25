import { useQuery } from '@tanstack/react-query'
import { providersService } from '../services/providers.service'
import type { ListProviderProductsParams } from '../types/providers.types'

export function useProviderProducts(id: number, params: ListProviderProductsParams = {}) {
  return useQuery({
    queryKey: ['providers', id, 'products', params],
    queryFn: () => providersService.listProducts(id, params),
    staleTime: 30_000,
    enabled: id > 0,
  })
}
