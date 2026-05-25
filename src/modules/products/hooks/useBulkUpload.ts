import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productsService } from '../services/products.service'

export function useBulkUpload() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => productsService.bulkUpload(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      const msg = result.skipped > 0
        ? `${result.inserted} productos cargados (${result.skipped} duplicados omitidos)`
        : `${result.inserted} productos cargados`
      toast.success(msg)
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message ?? 'Error al procesar el archivo'
      toast.error(msg)
    },
  })
}
