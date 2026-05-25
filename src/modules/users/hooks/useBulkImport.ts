import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { serviceUsersService } from '../services/service-users.service'
import type { BulkImportError } from '../types/service-user.types'

export function useBulkImport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => serviceUsersService.bulkImport(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['service-users'] })
      toast.success(`${result.inserted} usuario${result.inserted !== 1 ? 's' : ''} importado${result.inserted !== 1 ? 's' : ''} correctamente`)
    },
    onError: () => {
      // Error details handled in component (may contain duplicate list)
    },
  })
}

export type { BulkImportError }
