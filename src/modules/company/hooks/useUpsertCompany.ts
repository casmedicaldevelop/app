import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { companyService } from '../services/company.service'
import type { UpsertCompanyPayload } from '../types/company.types'

export function useUpsertCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpsertCompanyPayload) => companyService.upsert(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] })
      toast.success('Datos de empresa guardados correctamente')
    },
    onError: () => {
      toast.error('Error al guardar los datos de empresa')
    },
  })
}
