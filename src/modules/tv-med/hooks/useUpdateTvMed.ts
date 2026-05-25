import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tvMedService } from '../services/tv-med.service'
import type { UpdateTvMedPayload } from '../types/tv-med.types'

export function useUpdateTvMed(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateTvMedPayload) => tvMedService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tv-med'] })
      toast.success('Registro actualizado correctamente')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudieron guardar los cambios')
    },
  })
}
