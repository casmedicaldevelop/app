import { useQuery } from '@tanstack/react-query'
import { filingMipresService } from '../services/filing-mipres.service'

export function useDeliveries(id: number) {
  return useQuery({
    queryKey: ['filing', id, 'deliveries'],
    queryFn: () => filingMipresService.listDeliveries(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}
