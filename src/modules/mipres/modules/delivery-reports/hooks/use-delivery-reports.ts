import { useCallback, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deliveryReportsService } from '../services/delivery-reports.service'
import { extractMessage } from '../../../utils/error.helpers'
import type { FacturacionInput, ReporteEntregaItem } from '../types/delivery-reports.types'

export const DELIVERY_REPORTS_QUERY_KEY = (prescriptionNumber: string | undefined) =>
  ['mipres-delivery-reports', prescriptionNumber] as const

const SISPRO_CONSISTENCY_DELAY_MS = 5000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface UseDeliveryReportsArgs {
  prescriptionNumber: string | undefined
  onFacturacionSuccess?: () => void
}

export function useDeliveryReports({ prescriptionNumber, onFacturacionSuccess }: UseDeliveryReportsArgs) {
  const [cancelingIds, setCancelingIds] = useState<Set<number>>(new Set())
  const [facturando, setFacturando] = useState(false)
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: DELIVERY_REPORTS_QUERY_KEY(prescriptionNumber),
    queryFn: () => deliveryReportsService.load(prescriptionNumber!),
    enabled: !!prescriptionNumber,
    staleTime: 0,
  })

  const cancelDeliveryReport = useCallback(
    async (item: ReporteEntregaItem) => {
      if (cancelingIds.has(item.IDReporteEntrega)) return
      setCancelingIds((prev) => {
        const next = new Set(prev)
        next.add(item.IDReporteEntrega)
        return next
      })
      try {
        await deliveryReportsService.cancel(item.IDReporteEntrega)
        toast.success('Reporte de entrega anulado')
        await sleep(SISPRO_CONSISTENCY_DELAY_MS)
      } catch (err) {
        toast.error(extractMessage(err))
      } finally {
        try {
          await queryClient.invalidateQueries({
            queryKey: DELIVERY_REPORTS_QUERY_KEY(prescriptionNumber),
          })
        } catch (refetchErr) {
          console.error('[CANCEL DELIVERY REPORT] refetch failed', refetchErr)
        }
        setCancelingIds((prev) => {
          const next = new Set(prev)
          next.delete(item.IDReporteEntrega)
          return next
        })
      }
    },
    [cancelingIds, prescriptionNumber, queryClient],
  )

  const createFacturacion = useCallback(
    async (input: FacturacionInput): Promise<boolean> => {
      if (facturando) return false
      setFacturando(true)
      let succeeded = false
      try {
        await deliveryReportsService.createFacturacion(input)
        toast.success('Facturación registrada en SISPRO')
        succeeded = true
        // Espera de consistencia SISPRO antes de refetch + redirección.
        await sleep(SISPRO_CONSISTENCY_DELAY_MS)
      } catch (err) {
        toast.error(extractMessage(err))
      } finally {
        try {
          await queryClient.invalidateQueries({
            queryKey: DELIVERY_REPORTS_QUERY_KEY(prescriptionNumber),
          })
        } catch (refetchErr) {
          console.error('[CREATE FACTURACION] refetch failed', refetchErr)
        }
        setFacturando(false)
        if (succeeded) onFacturacionSuccess?.()
      }
      return succeeded
    },
    [facturando, prescriptionNumber, queryClient, onFacturacionSuccess],
  )

  return {
    reports: query.data ?? [],
    loading: query.isLoading,
    error: query.isError ? extractMessage(query.error) : null,
    cancelDeliveryReport,
    cancelingIds,
    createFacturacion,
    facturando,
    refetch: query.refetch,
  }
}
