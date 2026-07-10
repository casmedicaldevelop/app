import { useMutation, useQueryClient } from '@tanstack/react-query'
import { filingMipresService } from '../services/filing-mipres.service'
import type { UpdateRadicacionPayload } from '../types/filing-mipres.types'

/** Guarda el cierre de radicación y refresca el detalle (['filing', id]). */
export function useUpdateRadicacion(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateRadicacionPayload) =>
      filingMipresService.updateRadicacion(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['filing', id] })
    },
  })
}
