import { useMutation, useQueryClient } from '@tanstack/react-query'
import { filingEventService } from '../services/filing-event.service'
import type { RegisterDeliveryEventPayload } from '../services/filing-event.service'

/** Registra una entrega de la línea `itemId`; refresca el detalle de la cabecera `filingId`. */
export function useRegisterDelivery(itemId: number, filingId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RegisterDeliveryEventPayload) =>
      filingEventService.registerDelivery(itemId, payload),
    onSuccess: () => {
      // Refresca el detalle de la radicación (cantidades/estado de las líneas + estado general)
      // y el historial de entregas de esta línea.
      queryClient.invalidateQueries({ queryKey: ['filing-event', filingId] })
      queryClient.invalidateQueries({ queryKey: ['filing-event-item', itemId, 'deliveries'] })
    },
  })
}
