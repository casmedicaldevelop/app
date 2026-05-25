import { useCallback, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { schedulesService } from '../services/schedules.service'
import { extractMessage } from '../../../utils/error.helpers'
import type { ScheduleItem } from '../types/schedules.types'

export const SCHEDULES_QUERY_KEY = (prescriptionNumber: string | undefined) =>
  ['mipres-schedules', prescriptionNumber] as const

/**
 * SISPRO write/read eventual-consistency window. After PUT /api/AnularProgramacion
 * succeeds, the corresponding GET /api/ProgramacionXPrescripcion can still
 * return the row as active for a few seconds. Wait before refetching so the
 * UI shows the canceled state on the first refresh.
 */
const SISPRO_CONSISTENCY_DELAY_MS = 5000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface UseSchedulesArgs {
  prescriptionNumber: string | undefined
}

export function useSchedules({ prescriptionNumber }: UseSchedulesArgs) {
  const [cancelingIds, setCancelingIds] = useState<Set<number>>(new Set())
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: SCHEDULES_QUERY_KEY(prescriptionNumber),
    queryFn: () => schedulesService.load(prescriptionNumber!),
    enabled: !!prescriptionNumber,
    staleTime: 0,
  })

  const cancelSchedule = useCallback(
    async (item: ScheduleItem) => {
      if (cancelingIds.has(item.IDProgramacion)) return
      setCancelingIds((prev) => {
        const next = new Set(prev)
        next.add(item.IDProgramacion)
        return next
      })
      try {
        await schedulesService.cancel(item.IDProgramacion)
        toast.success('Programación anulada')
        // Espera de consistencia SISPRO antes de refetch.
        await sleep(SISPRO_CONSISTENCY_DELAY_MS)
      } catch (err) {
        toast.error(extractMessage(err))
      } finally {
        try {
          await queryClient.invalidateQueries({
            queryKey: SCHEDULES_QUERY_KEY(prescriptionNumber),
          })
        } catch (refetchErr) {
          console.error('[CANCEL SCHEDULE] refetch failed', refetchErr)
        }
        setCancelingIds((prev) => {
          const next = new Set(prev)
          next.delete(item.IDProgramacion)
          return next
        })
      }
    },
    [cancelingIds, prescriptionNumber, queryClient],
  )

  return {
    schedules: query.data ?? [],
    loading: query.isLoading,
    error: query.isError ? extractMessage(query.error) : null,
    cancelSchedule,
    cancelingIds,
    refetch: query.refetch,
  }
}
