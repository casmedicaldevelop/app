import { useQuery } from '@tanstack/react-query'
import { modulesService } from '../services/modules.service'

export function useModules(params: { isActive?: boolean } = {}) {
  return useQuery({
    queryKey: ['modules', params],
    queryFn: () => modulesService.list(params),
    staleTime: 5 * 60_000,
  })
}
