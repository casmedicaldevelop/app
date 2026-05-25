import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { companyService } from '../services/company.service'
import type { UpdateAiPayload } from '../types/company.types'

export function useUpdateAi() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateAiPayload) => companyService.updateAi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] })
      toast.success('Configuración de IA guardada')
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message ?? 'Error al guardar la configuración de IA'
      toast.error(msg)
    },
  })
}
