import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { modulesService } from '../services/modules.service'

export function useDeleteModule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => modulesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      toast.success('Módulo eliminado correctamente')
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message ?? 'Error al eliminar el módulo'
      toast.error(msg)
    },
  })
}
