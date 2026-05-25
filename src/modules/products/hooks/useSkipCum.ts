import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cumMatchingService } from '../services/cum-matching.service'
import type { SkipCumPayload } from '../types/products.types'

export function useSkipCum() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SkipCumPayload) => cumMatchingService.skipCumProvider1(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cum-matching-provider1-pending'] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Error al saltar el producto')
    },
  })
}
