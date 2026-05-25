import { useQuery } from '@tanstack/react-query'
import { serviceUsersService } from '../services/service-users.service'

export function useServiceUser(id: string) {
  return useQuery({
    queryKey: ['service-users', id],
    queryFn: () => serviceUsersService.getById(id),
    enabled: !!id,
  })
}
