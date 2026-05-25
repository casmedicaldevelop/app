import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryClient } from '../../../config/query.client'
import { providersService } from '../services/providers.service'

interface BulkUploadVars {
  file: File
  mode: 'upload' | 'update'
}

export function useBulkUploadProvider(providerId: number) {
  return useMutation({
    mutationFn: ({ file, mode }: BulkUploadVars) =>
      providersService.bulkUpload(providerId, file, mode),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['providers', providerId, 'products'] })
      if (result.mode === 'upload') {
        toast.success(`Carga completa: ${result.inserted} productos importados`)
      } else {
        toast.success(
          `Actualización completa: ${result.inserted} nuevos, ${result.updated} actualizados`,
        )
      }
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Error en la carga masiva')
    },
  })
}
