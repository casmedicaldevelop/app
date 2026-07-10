import { useMutation, useQueryClient } from '@tanstack/react-query'
import { filingMipresService } from '../services/filing-mipres.service'
import type { RegisterDeliveryPayload } from '../types/filing-mipres.types'

export function useRegisterDelivery(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RegisterDeliveryPayload) =>
      filingMipresService.registerDelivery(id, payload),
    onSuccess: () => {
      // Refresca el detalle (cantidades/estado) y el historial de entregas.
      queryClient.invalidateQueries({ queryKey: ['filing', id] })
      queryClient.invalidateQueries({ queryKey: ['filing', id, 'deliveries'] })
    },
  })
}
