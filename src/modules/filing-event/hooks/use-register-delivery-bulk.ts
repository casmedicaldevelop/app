import { useMutation, useQueryClient } from '@tanstack/react-query'
import { filingEventService } from '../services/filing-event.service'
import type { BulkDeliveryLine } from '../services/filing-event.service'

/** Registra la entrega de varias líneas de la radicación `filingId` en un mismo proceso. */
export function useRegisterDeliveryBulk(filingId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (lines: BulkDeliveryLine[]) =>
      filingEventService.registerDeliveryBulk(filingId, lines),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filing-event', filingId] })
      queryClient.invalidateQueries({ queryKey: ['event-contract'] })
    },
  })
}
