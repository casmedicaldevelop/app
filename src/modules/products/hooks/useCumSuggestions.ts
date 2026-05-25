import { useQuery } from '@tanstack/react-query'
import { cumMatchingService } from '../services/cum-matching.service'

export function useCumSuggestions(q: string) {
  return useQuery({
    queryKey: ['cum-suggestions-provider1', q],
    queryFn: () => cumMatchingService.getSuggestionsProvider1(q),
    enabled: q.trim().length > 2,
    staleTime: 60_000,
  })
}
