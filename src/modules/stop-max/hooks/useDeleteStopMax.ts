import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { stopMaxService } from '../services/stop-max.service'

export function useDeleteStopMax() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => stopMaxService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stop-max'] })
      toast.success('Registro eliminado')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo eliminar el registro')
    },
  })
}
