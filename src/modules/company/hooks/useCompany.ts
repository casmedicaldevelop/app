import { useQuery } from '@tanstack/react-query'
import { companyService } from '../services/company.service'

export function useCompany() {
  return useQuery({
    queryKey: ['company'],
    queryFn: () => companyService.get(),
    retry: false,
  })
}
