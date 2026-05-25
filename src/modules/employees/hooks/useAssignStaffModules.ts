import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { staffService } from '../services/staff.service'

export function useAssignStaffModules(staffMemberId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (moduleIds: string[]) => staffService.assignModules(staffMemberId, moduleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', staffMemberId] })
      toast.success('Módulos actualizados correctamente')
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message ?? 'Error al actualizar los módulos'
      toast.error(msg)
    },
  })
}
