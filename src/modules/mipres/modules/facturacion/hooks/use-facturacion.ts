import { useCallback, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { facturacionService } from '../services/facturacion.service'
import { extractMessage } from '../../../utils/error.helpers'
import type { FacturacionItem } from '../types/facturacion.types'

export const FACTURACION_QUERY_KEY = (prescriptionNumber: string | undefined) =>
  ['mipres-facturaciones', prescriptionNumber] as const

const SISPRO_CONSISTENCY_DELAY_MS = 5000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface UseFacturacionArgs {
  prescriptionNumber: string | undefined
}

export function useFacturacion({ prescriptionNumber }: UseFacturacionArgs) {
  const [cancelingIds, setCancelingIds] = useState<Set<number>>(new Set())
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: FACTURACION_QUERY_KEY(prescriptionNumber),
    queryFn: () => facturacionService.load(prescriptionNumber!),
    enabled: !!prescriptionNumber,
    staleTime: 0,
  })

  const cancelFacturacion = useCallback(
    async (item: FacturacionItem) => {
      if (cancelingIds.has(item.IDFacturacion)) return
      setCancelingIds((prev) => {
        const next = new Set(prev)
        next.add(item.IDFacturacion)
        return next
      })
      try {
        await facturacionService.cancel(item.IDFacturacion)
        toast.success('Facturación anulada')
        await sleep(SISPRO_CONSISTENCY_DELAY_MS)
      } catch (err) {
        toast.error(extractMessage(err))
      } finally {
        try {
          await queryClient.invalidateQueries({
            queryKey: FACTURACION_QUERY_KEY(prescriptionNumber),
          })
        } catch (refetchErr) {
          console.error('[CANCEL FACTURACION] refetch failed', refetchErr)
        }
        setCancelingIds((prev) => {
          const next = new Set(prev)
          next.delete(item.IDFacturacion)
          return next
        })
      }
    },
    [cancelingIds, prescriptionNumber, queryClient],
  )

  return {
    facturaciones: query.data ?? [],
    loading: query.isLoading,
    error: query.isError ? extractMessage(query.error) : null,
    cancelFacturacion,
    cancelingIds,
    refetch: query.refetch,
  }
}
