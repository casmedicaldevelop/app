import { useQuery } from '@tanstack/react-query'
import { filingEventService } from '../services/filing-event.service'

export function useFilingEvent(id: number) {
  return useQuery({
    queryKey: ['filing-event', id],
    queryFn: () => filingEventService.getById(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}
