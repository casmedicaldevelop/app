import { useQuery } from '@tanstack/react-query'
import { serviceUsersService } from '../services/service-users.service'
import type { ListServiceUsersParams } from '../types/service-user.types'

export function useServiceUsers(params: ListServiceUsersParams = {}) {
  return useQuery({
    queryKey: ['service-users', params],
    queryFn: () => serviceUsersService.list(params),
  })
}
