import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tvMedService } from '../services/tv-med.service'
import type { CreateTvMedPayload } from '../types/tv-med.types'

export function useCreateTvMed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTvMedPayload) => tvMedService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tv-med'] })
      toast.success('Registro creado correctamente')
    },
    onError: () => {
      toast.error('Error al crear el registro')
    },
  })
}
