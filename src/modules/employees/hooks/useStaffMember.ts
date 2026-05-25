import { useQuery } from '@tanstack/react-query'
import { staffService } from '../services/staff.service'

export function useStaffMember(id: string) {
  return useQuery({
    queryKey: ['staff', id],
    queryFn: () => staffService.getById(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}
