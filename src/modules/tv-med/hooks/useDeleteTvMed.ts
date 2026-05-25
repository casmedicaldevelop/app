import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tvMedService } from '../services/tv-med.service'

export function useDeleteTvMed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => tvMedService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tv-med'] })
      toast.success('Registro eliminado correctamente')
    },
    onError: () => {
      toast.error('Error al eliminar el registro')
    },
  })
}
