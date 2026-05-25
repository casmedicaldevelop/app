import { useQuery } from '@tanstack/react-query'
import { cumMatchingService } from '../services/cum-matching.service'

export function useCumMatchingPending() {
  return useQuery({
    queryKey: ['cum-matching-provider1-pending'],
    queryFn: () => cumMatchingService.getPendingProvider1(),
    staleTime: 0,
  })
}
