import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tvDataService } from '../services/tv-data.service'

export function useDeleteTvData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => tvDataService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tv-data'] })
      toast.success('Registro eliminado correctamente')
    },
    onError: () => {
      toast.error('Error al eliminar el registro')
    },
  })
}
