import { useQuery } from '@tanstack/react-query'
import { tvDataService } from '../services/tv-data.service'
import type { ListTvDataParams } from '../types/tv-data.types'

export function useTvDataList(params: ListTvDataParams = {}) {
  return useQuery({
    queryKey: ['tv-data', params],
    queryFn: () => tvDataService.list(params),
  })
}
