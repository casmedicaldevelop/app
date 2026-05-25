import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { modulesService } from '../services/modules.service'
import type { UpdateModulePayload } from '../types/modules.types'
import { useAuthStore } from '../../auth/auth.store'
import { apiFetch } from '../../../lib/api-fetch'
import type { MeResponse } from '../../auth/types/auth.types'

export function useUpdateModule(id: string) {
  const queryClient = useQueryClient()
  const { setUser } = useAuthStore()

  return useMutation({
    mutationFn: (payload: UpdateModulePayload) => modulesService.update(id, payload),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      try {
        const user = await apiFetch<MeResponse>('/auth/me')
        setUser(user)
      } catch {
        // apiFetch handles 401 (refresh + retry or logout); other errors: store refreshes on next load
      }
      toast.success('Módulo actualizado correctamente')
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message ?? 'Error al actualizar el módulo'
      toast.error(msg)
    },
  })
}
