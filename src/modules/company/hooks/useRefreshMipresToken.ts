import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { companyService } from '../services/company.service'

export function useRefreshMipresToken() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => companyService.refreshMipresToken(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] })
      toast.success('Token MIPRES actualizado correctamente')
    },
    onError: () => {
      toast.error('Error al refrescar el token MIPRES')
    },
  })
}
