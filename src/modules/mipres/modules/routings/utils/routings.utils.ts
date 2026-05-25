import type { RoutingItem } from '../types/routings.types'

/**
 * SISPRO codes observed for `EstDireccionamiento` (mismo esquema que
 * `EstProgramacion`):
 *   0 = Anulado (también tiene FecAnulacion ≠ null)
 *   1 = Vigente (activo, sin entrega)
 *   2 = Completado (ya tiene entrega registrada contra él)
 * Otros valores no documentados se tratan como 'unknown'.
 */
export type RoutingStatus = 'canceled' | 'active' | 'delivered' | 'unknown'

export function routingStatus(
  r: Pick<RoutingItem, 'EstDireccionamiento' | 'FecAnulacion'>,
): RoutingStatus {
  if (r.FecAnulacion !== null || r.EstDireccionamiento === 0) return 'canceled'
  if (r.EstDireccionamiento === 1) return 'active'
  if (r.EstDireccionamiento === 2) return 'delivered'
  return 'unknown'
}

/**
 * "Active" = NO cancelado. Cubre 'active' (1) y 'delivered' (2); solo
 * 'canceled' (0 o FecAnulacion ≠ null) es la negación.
 */
export function isRoutingActive(
  r: Pick<RoutingItem, 'EstDireccionamiento' | 'FecAnulacion'>,
): boolean {
  return routingStatus(r) !== 'canceled'
}

export function countActiveRoutings(
  items: ReadonlyArray<Pick<RoutingItem, 'EstDireccionamiento' | 'FecAnulacion'>>,
): number {
  return items.reduce((acc, r) => (isRoutingActive(r) ? acc + 1 : acc), 0)
}
