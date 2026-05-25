import { useQuery } from '@tanstack/react-query'
import { stopMaxService } from '../services/stop-max.service'

export function useStopMaxItem(id: number) {
  return useQuery({
    queryKey: ['stop-max', id],
    queryFn: () => stopMaxService.getById(id),
    enabled: !!id,
    staleTime: 30_000,
  })
}
