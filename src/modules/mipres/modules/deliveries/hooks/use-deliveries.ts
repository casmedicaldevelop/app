import { useCallback, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deliveriesService } from '../services/deliveries.service'
import { extractMessage } from '../../../utils/error.helpers'
import type { CreateDeliveryPayload, EntregaItem } from '../types/deliveries.types'

export const DELIVERIES_QUERY_KEY = (prescriptionNumber: string | undefined) =>
  ['mipres-deliveries', prescriptionNumber] as const

interface UseDeliveriesArgs {
  prescriptionNumber: string | undefined
}

/**
 * SISPRO write/read eventual-consistency window. After a successful POST/PUT,
 * the next GET may return stale data for a few seconds. Wait before refetching.
 */
const SISPRO_CONSISTENCY_DELAY_MS = 5000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function useDeliveries({ prescriptionNumber }: UseDeliveriesArgs) {
  const [registering, setRegistering] = useState(false)
  const [cancelingIds, setCancelingIds] = useState<Set<number>>(new Set())
  const [reportingIds, setReportingIds] = useState<Set<number>>(new Set())
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: DELIVERIES_QUERY_KEY(prescriptionNumber),
    queryFn: () => deliveriesService.load(prescriptionNumber!),
    enabled: !!prescriptionNumber,
    staleTime: 0,
  })

  const registerDelivery = useCallback(
    async (payload: CreateDeliveryPayload): Promise<boolean> => {
      if (registering) return false
      setRegistering(true)
      try {
        await deliveriesService.create(payload)
        toast.success('Entrega registrada')
        try {
          await queryClient.invalidateQueries({
            queryKey: DELIVERIES_QUERY_KEY(prescriptionNumber),
          })
        } catch (refetchErr) {
          console.error('[REGISTER DELIVERY] refetch failed', refetchErr)
        }
        return true
      } catch (err) {
        toast.error(extractMessage(err))
        return false
      } finally {
        setRegistering(false)
      }
    },
    [prescriptionNumber, queryClient, registering],
  )

  const cancelDelivery = useCallback(
    async (item: EntregaItem) => {
      if (cancelingIds.has(item.IDEntrega)) return
      setCancelingIds((prev) => {
        const next = new Set(prev)
        next.add(item.IDEntrega)
        return next
      })
      try {
        await deliveriesService.cancel(item.IDEntrega)
        toast.success('Entrega anulada')
      } catch (err) {
        toast.error(extractMessage(err))
      } finally {
        try {
          await queryClient.invalidateQueries({
            queryKey: DELIVERIES_QUERY_KEY(prescriptionNumber),
          })
        } catch (refetchErr) {
          console.error('[CANCEL DELIVERY] refetch failed', refetchErr)
        }
        setCancelingIds((prev) => {
          const next = new Set(prev)
          next.delete(item.IDEntrega)
          return next
        })
      }
    },
    [cancelingIds, prescriptionNumber, queryClient],
  )

  const reportDelivery = useCallback(
    async (item: EntregaItem, valorEntregado: string): Promise<boolean> => {
      if (reportingIds.has(item.IDEntrega)) return false
      setReportingIds((prev) => {
        const next = new Set(prev)
        next.add(item.IDEntrega)
        return next
      })
      let succeeded = false
      try {
        await deliveriesService.createReport({
          miPresEntregaId: String(item.ID),
          valorEntregado,
        })
        toast.success('Reporte registrado')
        succeeded = true
        await sleep(SISPRO_CONSISTENCY_DELAY_MS)
      } catch (err) {
        toast.error(extractMessage(err))
      } finally {
        try {
          await queryClient.invalidateQueries({
            queryKey: DELIVERIES_QUERY_KEY(prescriptionNumber),
          })
        } catch (refetchErr) {
          console.error('[REPORT DELIVERY] refetch failed', refetchErr)
        }
        setReportingIds((prev) => {
          const next = new Set(prev)
          next.delete(item.IDEntrega)
          return next
        })
      }
      return succeeded
    },
    [prescriptionNumber, queryClient, reportingIds],
  )

  return {
    deliveries: query.data ?? [],
    loading: query.isLoading,
    error: query.isError ? extractMessage(query.error) : null,
    registerDelivery,
    registering,
    cancelDelivery,
    cancelingIds,
    reportDelivery,
    reportingIds,
    refetch: query.refetch,
  }
}
