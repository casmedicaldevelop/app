import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { stopMaxService } from '../services/stop-max.service'
import type { UpdateStopMaxPayload } from '../types/stop-max.types'

export function useUpdateStopMax(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateStopMaxPayload) => stopMaxService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stop-max'] })
      toast.success('Tope máximo actualizado')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudieron guardar los cambios')
    },
  })
}
