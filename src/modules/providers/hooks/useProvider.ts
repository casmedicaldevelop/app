import { useQuery } from '@tanstack/react-query'
import { providersService } from '../services/providers.service'

export function useProvider(id: number) {
  return useQuery({
    queryKey: ['providers', id],
    queryFn: () => providersService.getById(id),
    staleTime: 60_000,
  })
}
