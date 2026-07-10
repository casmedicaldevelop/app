import { useQuery } from '@tanstack/react-query'
import { filingEventService } from '../services/filing-event.service'

/** Entregas de UNA línea (filing_event_item). */
export function useDeliveries(itemId: number) {
  return useQuery({
    queryKey: ['filing-event-item', itemId, 'deliveries'],
    queryFn: () => filingEventService.listDeliveries(itemId),
    enabled: Number.isFinite(itemId) && itemId > 0,
  })
}
