import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tvDataService } from '../services/tv-data.service'
import type { UpdateTvDataPayload } from '../types/tv-data.types'

export function useUpdateTvData(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateTvDataPayload) => tvDataService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tv-data'] })
      toast.success('Registro actualizado correctamente')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudieron guardar los cambios')
    },
  })
}
