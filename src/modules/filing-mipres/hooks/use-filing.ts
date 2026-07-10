import { useQuery } from '@tanstack/react-query'
import { filingMipresService } from '../services/filing-mipres.service'

export function useFiling(id: number) {
  return useQuery({
    queryKey: ['filing', id],
    queryFn: () => filingMipresService.getById(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}
