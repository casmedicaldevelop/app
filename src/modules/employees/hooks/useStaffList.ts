import { useQuery } from '@tanstack/react-query'
import { staffService } from '../services/staff.service'
import type { ListStaffParams } from '../types/staff.types'

export function useStaffList(params: ListStaffParams = {}) {
  return useQuery({
    queryKey: ['staff', params],
    queryFn: () => staffService.list(params),
    staleTime: 30_000,
  })
}
