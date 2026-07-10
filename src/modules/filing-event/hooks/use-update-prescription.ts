import { useMutation, useQueryClient } from '@tanstack/react-query'
import { filingEventService } from '../services/filing-event.service'

type PrescriptionPatch = Partial<{
  frequencyPerDay: number
  treatmentDuration: number
  prescribedQuantity: number
  treatmentDays: number
}>

/** Edita un valor de prescripción de la línea `itemId` y refresca el detalle de la cabecera `filingId`. */
export function useUpdatePrescription(itemId: number, filingId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: PrescriptionPatch) => filingEventService.updatePrescription(itemId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['filing-event', filingId] })
    },
  })
}
