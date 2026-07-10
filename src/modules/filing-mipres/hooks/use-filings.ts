import { useQuery } from '@tanstack/react-query'
import { filingMipresService } from '../services/filing-mipres.service'
import type { ListFilingParams } from '../types/filing-mipres.types'

export function useFilings(params: ListFilingParams = {}) {
  return useQuery({
    queryKey: ['filings', params],
    queryFn: () => filingMipresService.list(params),
  })
}
