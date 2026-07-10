import { useQuery } from '@tanstack/react-query'
import { filingEventService, type FilingEventListParams } from '../services/filing-event.service'

export function useFilingEventList(params: FilingEventListParams) {
  return useQuery({
    queryKey: ['filing-event-list', params],
    queryFn: () => filingEventService.list(params),
    staleTime: 10_000,
  })
}
