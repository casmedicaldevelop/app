import type { ScheduleItem } from '../types/schedules.types'

/**
 * SISPRO codes observed for `EstProgramacion`:
 *   0 = Anulada (also has FecAnulacion ≠ null)
 *   1 = Vigente (active, not yet delivered)
 *   2 = Completada (already has a delivery registered against it)
 * Otros valores no documentados se tratan como 'unknown'.
 */
export type ScheduleStatus = 'canceled' | 'active' | 'delivered' | 'unknown'

export function scheduleStatus(
  s: Pick<ScheduleItem, 'EstProgramacion' | 'FecAnulacion'>,
): ScheduleStatus {
  if (s.FecAnulacion !== null || s.EstProgramacion === 0) return 'canceled'
  if (s.EstProgramacion === 1) return 'active'
  if (s.EstProgramacion === 2) return 'delivered'
  return 'unknown'
}

/**
 * "Active" en este contexto = NO cancelada. Cubre tanto 'active' (1) como
 * 'delivered' (2), porque ambos son estados vigentes; solo 'canceled' (0 o
 * FecAnulacion ≠ null) es la negación.
 */
export function isScheduleActive(
  s: Pick<ScheduleItem, 'EstProgramacion' | 'FecAnulacion'>,
): boolean {
  return scheduleStatus(s) !== 'canceled'
}
