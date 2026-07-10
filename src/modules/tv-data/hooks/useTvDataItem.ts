import { useQuery } from '@tanstack/react-query'
import { tvDataService } from '../services/tv-data.service'

export function useTvDataItem(id: number) {
  return useQuery({
    queryKey: ['tv-data', id],
    queryFn: () => tvDataService.getById(id),
    enabled: !!id,
  })
}
