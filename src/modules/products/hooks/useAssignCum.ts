import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cumMatchingService } from '../services/cum-matching.service'
import type { AssignCumPayload } from '../types/products.types'

export function useAssignCum() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AssignCumPayload) => cumMatchingService.assignCumProvider1(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cum-matching-provider1-pending'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(`CUM asignado a ${data.updated} registro${data.updated !== 1 ? 's' : ''}`)
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Error al asignar CUM')
    },
  })
}
