import { apiFetch } from '../../../../../lib/api-fetch'
import { recordRequest } from '../../../../../lib/request-log'
import { toArray } from '../../../services/array.helper'
import type { FacturacionItem } from '../types/facturacion.types'

export const FACTURACION_DEBUG_KEYS = {
  load: 'mipres:load-facturaciones',
  cancel: 'mipres:cancel-facturacion',
} as const

export const facturacionService = {
  async load(prescriptionNumber: string): Promise<FacturacionItem[]> {
    const raw = await apiFetch<FacturacionItem | FacturacionItem[]>(
      `/mipres/facturacion/prescription/${encodeURIComponent(prescriptionNumber)}`,
      undefined,
      { onMeta: (meta) => recordRequest(FACTURACION_DEBUG_KEYS.load, meta) },
    )
    return toArray(raw)
  },

  async cancel(idFacturacion: number): Promise<unknown> {
    return apiFetch(
      `/mipres/facturacion/${idFacturacion}/cancel`,
      { method: 'PUT' },
      { onMeta: (meta) => recordRequest(FACTURACION_DEBUG_KEYS.cancel, meta) },
    )
  },
}
