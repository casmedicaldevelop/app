import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tvDataService } from '../services/tv-data.service'

export function useBulkUploadTvData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => tvDataService.bulkUpload(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['tv-data'] })
      toast.success(`Carga completada: ${result.inserted} registros insertados`)
    },
    onError: () => {
      toast.error('Error al procesar el archivo')
    },
  })
}
