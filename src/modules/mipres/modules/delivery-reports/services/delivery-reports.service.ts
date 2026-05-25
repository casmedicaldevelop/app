import { apiFetch } from '../../../../../lib/api-fetch'
import { recordRequest } from '../../../../../lib/request-log'
import { toArray } from '../../../services/array.helper'
import type { FacturacionInput, ReporteEntregaItem } from '../types/delivery-reports.types'

export const DELIVERY_REPORTS_DEBUG_KEYS = {
  load: 'mipres:load-delivery-reports',
  cancel: 'mipres:cancel-delivery-report',
  facturacion: 'mipres:create-facturacion',
} as const

export const deliveryReportsService = {
  async load(prescriptionNumber: string): Promise<ReporteEntregaItem[]> {
    const raw = await apiFetch<ReporteEntregaItem | ReporteEntregaItem[]>(
      `/mipres/delivery-report/prescription/${encodeURIComponent(prescriptionNumber)}`,
      undefined,
      { onMeta: (meta) => recordRequest(DELIVERY_REPORTS_DEBUG_KEYS.load, meta) },
    )
    return toArray(raw)
  },

  async cancel(reportId: number): Promise<unknown> {
    return apiFetch(
      `/mipres/delivery-report/${reportId}/cancel`,
      { method: 'PUT' },
      { onMeta: (meta) => recordRequest(DELIVERY_REPORTS_DEBUG_KEYS.cancel, meta) },
    )
  },

  async createFacturacion(input: FacturacionInput): Promise<unknown> {
    return apiFetch(
      `/mipres/facturacion`,
      { method: 'PUT', body: JSON.stringify(input) },
      { onMeta: (meta) => recordRequest(DELIVERY_REPORTS_DEBUG_KEYS.facturacion, meta) },
    )
  },
}
