import { useQuery } from '@tanstack/react-query'
import { providersService } from '../services/providers.service'

export function useProviders() {
  return useQuery({
    queryKey: ['providers'],
    queryFn: () => providersService.list(),
    staleTime: 60_000,
  })
}
