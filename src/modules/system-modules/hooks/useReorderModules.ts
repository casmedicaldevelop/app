import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { modulesService } from '../services/modules.service'

export function useReorderModules() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (order: string[]) => modulesService.reorder({ order }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] })
    },
    onError: () => {
      toast.error('No se pudo guardar el nuevo orden')
    },
  })
}
