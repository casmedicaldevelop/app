import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { stopMaxService } from '../services/stop-max.service'

export function useBulkUploadStopMax() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => stopMaxService.bulkUpload(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['stop-max'] })
      toast.success(`${result.inserted} registros cargados`)
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Error al procesar el archivo')
    },
  })
}
