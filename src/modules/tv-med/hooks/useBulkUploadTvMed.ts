import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tvMedService } from '../services/tv-med.service'

export function useBulkUploadTvMed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => tvMedService.bulkUpload(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['tv-med'] })
      toast.success(`Carga completada: ${result.inserted} registros insertados`)
    },
    onError: () => {
      toast.error('Error al procesar el archivo')
    },
  })
}
