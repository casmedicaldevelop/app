import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { companyService } from '../services/company.service'
import type { UpdateMipresPayload } from '../types/company.types'

export function useUpdateMipres() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateMipresPayload) => companyService.updateMipres(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] })
      toast.success('Configuración MiPres guardada correctamente')
    },
    onError: () => {
      toast.error('Error al guardar la configuración MiPres')
    },
  })
}
