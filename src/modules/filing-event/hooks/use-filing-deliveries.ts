import { useQuery } from '@tanstack/react-query'
import { filingEventService } from '../services/filing-event.service'

/** Todas las entregas registradas de la radicación `filingId`. */
export function useFilingDeliveries(filingId: number) {
  return useQuery({
    queryKey: ['filing-event', filingId, 'all-deliveries'],
    queryFn: () => filingEventService.listFilingDeliveries(filingId),
  })
}
