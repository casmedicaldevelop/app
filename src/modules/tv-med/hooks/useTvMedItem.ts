import { useQuery } from '@tanstack/react-query'
import { tvMedService } from '../services/tv-med.service'

export function useTvMedItem(id: number) {
  return useQuery({
    queryKey: ['tv-med', id],
    queryFn: () => tvMedService.getById(id),
    enabled: !!id,
  })
}
