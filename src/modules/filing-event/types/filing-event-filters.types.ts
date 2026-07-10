import type { FilingEventListParams } from '../services/filing-event.service'

/**
 * Contrato de filtros de la lista de radicaciones de evento.
 * Espejo de types/filing-mipres.types.ts: el tipo, el valor vacío, el contador de filtros activos
 * y la traducción a params viven aquí, no en el componente del drawer.
 */
export interface FilingEventFilters {
  userDocument: string
  userName: string
  userType: string
}

export const EMPTY_FILTERS: FilingEventFilters = {
  userDocument: '',
  userName: '',
  userType: '',
}

export function countActiveFilters(f: FilingEventFilters): number {
  let n = 0
  if (f.userDocument.trim()) n++
  if (f.userName.trim()) n++
  if (f.userType) n++
  return n
}

/** Params del endpoint: los vacíos no se envían. */
export function filtersToParams(f: FilingEventFilters): FilingEventListParams {
  const p: FilingEventListParams = {}
  if (f.userDocument.trim()) p.userDocument = f.userDocument.trim()
  if (f.userName.trim()) p.userName = f.userName.trim()
  if (f.userType) p.userType = f.userType
  return p
}
