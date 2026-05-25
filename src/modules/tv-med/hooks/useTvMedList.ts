import { useQuery } from '@tanstack/react-query'
import { tvMedService } from '../services/tv-med.service'
import type { ListTvMedParams } from '../types/tv-med.types'

export function useTvMedList(params: ListTvMedParams = {}) {
  return useQuery({
    queryKey: ['tv-med', params],
    queryFn: () => tvMedService.list(params),
  })
}
