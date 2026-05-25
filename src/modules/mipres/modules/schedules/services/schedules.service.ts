import { apiFetch } from '../../../../../lib/api-fetch'
import { recordRequest } from '../../../../../lib/request-log'
import { toArray } from '../../../services/array.helper'
import type { CreateSchedulePayload, ScheduleItem } from '../types/schedules.types'

export const SCHEDULES_DEBUG_KEYS = {
  load: 'mipres:load-schedules',
  create: 'mipres:create-schedule',
  cancel: 'mipres:cancel-schedule',
} as const

export const schedulesService = {
  async load(prescriptionNumber: string): Promise<ScheduleItem[]> {
    const raw = await apiFetch<ScheduleItem | ScheduleItem[]>(
      `/mipres/schedule/prescription/${encodeURIComponent(prescriptionNumber)}`,
      undefined,
      { onMeta: (meta) => recordRequest(SCHEDULES_DEBUG_KEYS.load, meta) },
    )
    return toArray(raw)
  },

  async create(payload: CreateSchedulePayload): Promise<unknown> {
    return apiFetch(
      '/mipres/schedule',
      { method: 'POST', body: JSON.stringify(payload) },
      { onMeta: (meta) => recordRequest(SCHEDULES_DEBUG_KEYS.create, meta) },
    )
  },

  async cancel(scheduleId: number): Promise<unknown> {
    return apiFetch(
      `/mipres/schedule/${scheduleId}/cancel`,
      { method: 'PUT' },
      { onMeta: (meta) => recordRequest(SCHEDULES_DEBUG_KEYS.cancel, meta) },
    )
  },
}
