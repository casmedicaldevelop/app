import { useMutation, useQueryClient } from '@tanstack/react-query'
import { filingEventService } from '../services/filing-event.service'

/** Registra el código de radicado y refresca el detalle (['filing-event', id]). */
export function useSetRadicado(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (filingCode: string) => filingEventService.setRadicado(id, filingCode),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['filing-event', id] })
    },
  })
}
