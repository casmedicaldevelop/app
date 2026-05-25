import { useQuery } from '@tanstack/react-query'
import { stopMaxService } from '../services/stop-max.service'
import type { ListStopMaxParams } from '../types/stop-max.types'

export function useStopMaxList(params: ListStopMaxParams = {}) {
  return useQuery({
    queryKey: ['stop-max', params],
    queryFn: () => stopMaxService.list(params),
    staleTime: 30_000,
  })
}
