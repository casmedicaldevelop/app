import { apiFetch } from '../../../../../lib/api-fetch'
import { recordRequest } from '../../../../../lib/request-log'
import { toArray } from '../../../services/array.helper'
import type {
  CreateDeliveryPayload,
  CreateDeliveryReportPayload,
  EntregaItem,
} from '../types/deliveries.types'

export const DELIVERIES_DEBUG_KEYS = {
  load: 'mipres:load-deliveries',
  create: 'mipres:create-delivery',
  cancel: 'mipres:cancel-delivery',
  createReport: 'mipres:create-delivery-report',
} as const

export const deliveriesService = {
  async load(prescriptionNumber: string): Promise<EntregaItem[]> {
    const raw = await apiFetch<EntregaItem | EntregaItem[]>(
      `/mipres/delivery/prescription/${encodeURIComponent(prescriptionNumber)}`,
      undefined,
      { onMeta: (meta) => recordRequest(DELIVERIES_DEBUG_KEYS.load, meta) },
    )
    return toArray(raw)
  },

  async create(payload: CreateDeliveryPayload): Promise<unknown> {
    return apiFetch(
      '/mipres/delivery',
      { method: 'POST', body: JSON.stringify(payload) },
      { onMeta: (meta) => recordRequest(DELIVERIES_DEBUG_KEYS.create, meta) },
    )
  },

  async cancel(deliveryId: number): Promise<unknown> {
    return apiFetch(
      `/mipres/delivery/${deliveryId}/cancel`,
      { method: 'PUT' },
      { onMeta: (meta) => recordRequest(DELIVERIES_DEBUG_KEYS.cancel, meta) },
    )
  },

  async createReport(payload: CreateDeliveryReportPayload): Promise<unknown> {
    return apiFetch(
      '/mipres/delivery-report',
      { method: 'POST', body: JSON.stringify(payload) },
      { onMeta: (meta) => recordRequest(DELIVERIES_DEBUG_KEYS.createReport, meta) },
    )
  },
}
