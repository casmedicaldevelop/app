import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tvDataService } from '../services/tv-data.service'
import type { CreateTvDataPayload } from '../types/tv-data.types'

export function useCreateTvData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTvDataPayload) => tvDataService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tv-data'] })
      toast.success('Registro creado correctamente')
    },
    onError: () => {
      toast.error('Error al crear el registro')
    },
  })
}
