import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { staffService } from '../services/staff.service'
import type { UpdateStaffPayload } from '../types/staff.types'

export function useUpdateStaff(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateStaffPayload) => staffService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
      toast.success('Personal actualizado correctamente')
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message ?? 'Error al actualizar el personal'
      toast.error(msg)
    },
  })
}
