import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { staffService } from '../services/staff.service'
import type { CreateStaffPayload } from '../types/staff.types'

export function useCreateStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => staffService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
      toast.success('Personal creado correctamente')
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message ?? 'Error al crear el personal'
      toast.error(msg)
    },
  })
}
