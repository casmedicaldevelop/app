import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { schedulesService } from '../../schedules/services/schedules.service'
import { SCHEDULES_QUERY_KEY } from '../../schedules/hooks/use-schedules'
import { extractMessage } from '../../../utils/error.helpers'
import type { RoutingItem } from '../types/routings.types'
import type { CreateSchedulePayload } from '../../schedules/types/schedules.types'
import type { Company } from '../../../../company/types/company.types'

/**
 * SISPRO write/read eventual-consistency window. After PUT /api/Programacion
 * succeeds, the corresponding GET /api/ProgramacionXPrescripcion can still
 * return the old list for a few seconds. Wait before refetching so the user
 * sees the new schedule appear instead of an empty round-trip.
 */
const SISPRO_CONSISTENCY_DELAY_MS = 5000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface UseRoutingsArgs {
  prescriptionNumber: string | undefined
  company: Company | null | undefined
  onBindSuccess?: () => void
}

/**
 * Hook que maneja la acción de "Amarrar" (bind) un direccionamiento → crea
 * una programación en SISPRO. Tras éxito espera la ventana de consistencia,
 * invalida la query de schedules y dispara `onBindSuccess` para que la
 * pantalla pueda redirigir al tool Programaciones.
 */
export function useRoutings({ prescriptionNumber, company, onBindSuccess }: UseRoutingsArgs) {
  const [bindingIds, setBindingIds] = useState<Set<number>>(new Set())
  const queryClient = useQueryClient()

  const bindRouting = useCallback(
    async (item: RoutingItem, codSerTecOverride?: string) => {
      if (!company?.nit || !company?.codeProvider) {
        toast.error('Configurá NIT y código del prestador en la empresa antes de amarrar')
        return
      }
      if (bindingIds.has(item.ID)) return

      setBindingIds((prev) => {
        const next = new Set(prev)
        next.add(item.ID)
        return next
      })
      let succeeded = false
      try {
        const codSerTec = (codSerTecOverride ?? item.CodSerTecAEntregar).trim()
        const payload: CreateSchedulePayload = {
          miPresDireccionId: String(item.ID),
          fecMaxEnt: item.FecMaxEnt,
          tipoIdSedeProv: 'NI',
          noIdSedeProv: company.nit,
          codSedeProv: company.codeProvider,
          codSerTecAEntregar: codSerTec,
          cantTotAEntregar: item.CantTotAEntregar,
        }
        await schedulesService.create(payload)
        toast.success('Programación registrada')
        succeeded = true
        // Espera de consistencia SISPRO antes de refetch + redirección.
        await sleep(SISPRO_CONSISTENCY_DELAY_MS)
      } catch (err) {
        toast.error(extractMessage(err))
      } finally {
        try {
          await queryClient.invalidateQueries({
            queryKey: SCHEDULES_QUERY_KEY(prescriptionNumber),
          })
        } catch (refetchErr) {
          console.error('[BIND ROUTING] refetch failed', refetchErr)
        }
        setBindingIds((prev) => {
          const next = new Set(prev)
          next.delete(item.ID)
          return next
        })
        if (succeeded) onBindSuccess?.()
      }
    },
    [bindingIds, company, prescriptionNumber, queryClient, onBindSuccess],
  )

  return {
    bindRouting,
    bindingIds,
  }
}
