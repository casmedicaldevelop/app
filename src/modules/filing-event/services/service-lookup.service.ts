import { apiFetch } from '../../../lib/api-fetch'
import type { TvMedEvento } from '../../tvmed-evento/types/tvmed-evento.types'

/** Filas de tvmed_evento / tvins_evento; ambas comparten la misma forma. */
export type ServiceRow = TvMedEvento

export const serviceLookup = {
  /** Medicamentos con ese cum exacto (tvmed_evento). */
  med(cum: string): Promise<ServiceRow[]> {
    return apiFetch<ServiceRow[]>(`/tvmed-evento/by-cum/${encodeURIComponent(cum)}`)
  },
  /** Insumos con ese cum exacto (tvins_evento). */
  ins(cum: string): Promise<ServiceRow[]> {
    return apiFetch<ServiceRow[]>(`/tvins-evento/by-cum/${encodeURIComponent(cum)}`)
  },
}
