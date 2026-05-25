import type { EntregaItem } from '../types/deliveries.types'

/**
 * SISPRO codes observed for `EstEntrega` (mismo esquema que `EstProgramacion`
 * y `EstDireccionamiento`):
 *   0 = Anulada (también tiene FecAnulacion ≠ null)
 *   1 = Vigente (entrega registrada, aún sin reporte)
 *   2 = Completada (ya tiene reporte de entrega registrado contra ella)
 */
export type EntregaStatus = 'canceled' | 'active' | 'completed' | 'unknown'

export function entregaStatus(
  item: Pick<EntregaItem, 'EstEntrega' | 'FecAnulacion'>,
): EntregaStatus {
  if (item.FecAnulacion !== null || item.EstEntrega === 0) return 'canceled'
  if (item.EstEntrega === 1) return 'active'
  if (item.EstEntrega === 2) return 'completed'
  return 'unknown'
}
