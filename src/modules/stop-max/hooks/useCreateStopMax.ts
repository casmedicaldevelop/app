import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { stopMaxService } from '../services/stop-max.service'
import type { CreateStopMaxPayload } from '../types/stop-max.types'

export function useCreateStopMax() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateStopMaxPayload) => stopMaxService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stop-max'] })
      toast.success('Tope máximo creado')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo crear el tope máximo')
    },
  })
}
