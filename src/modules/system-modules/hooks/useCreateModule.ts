import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { modulesService } from '../services/modules.service'
import type { CreateModulePayload } from '../types/modules.types'

export function useCreateModule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateModulePayload) => modulesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      toast.success('Módulo creado correctamente')
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message ?? 'Error al crear el módulo'
      toast.error(msg)
    },
  })
}
