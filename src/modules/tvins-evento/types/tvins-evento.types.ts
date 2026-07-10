export interface MeasurementUnit {
  code: number
  description: string
}

export interface ScientificUnit {
  code: number
  name: string
  description: string
}

export interface PharmaceuticalForm {
  code: string
  description: string
}

export interface TvInsEvento {
  id: number
  cum: string
  name: string
  value: number
  concentration: string
  presentation: string
  administrationRoute: string
  shortName: string
  measurementUnit: number
  pharmaceuticalForm: string
  dispensingUnit: number
  isActive: boolean
  createdAt: string
  // Descripciones de los catálogos (para mostrar el nombre, no el código).
  measurementUnitRef: ScientificUnit
  dispensingUnitRef: MeasurementUnit
  pharmaceuticalFormRef: PharmaceuticalForm
}

export interface TvInsEventoPage {
  data: TvInsEvento[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateTvInsEventoPayload {
  cum: string
  name: string
  value: number
  concentration: string
  presentation: string
  administrationRoute: string
  shortName: string
  measurementUnit: number
  pharmaceuticalForm: string
  dispensingUnit: number
}

export type UpdateTvInsEventoPayload = Partial<CreateTvInsEventoPayload>

export interface ListTvInsEventoParams {
  page?: number
  limit?: number
  cum?: string
  name?: string
  isActive?: string // 'true' | 'false'
}

/** Estado de los filtros del drawer: solo cum, nombre y estado. */
export interface EventoFilters {
  cum: string
  name: string
  estado: string // '' (todos) | 'true' (activo) | 'false' (inactivo)
}

export const EMPTY_EVENTO_FILTERS: EventoFilters = { cum: '', name: '', estado: '' }

export function countActiveEventoFilters(f: EventoFilters): number {
  return Object.values(f).filter((v) => v.trim() !== '').length
}

export function eventoFiltersToParams(f: EventoFilters): ListTvInsEventoParams {
  const p: ListTvInsEventoParams = {}
  if (f.cum.trim()) p.cum = f.cum.trim()
  if (f.name.trim()) p.name = f.name.trim()
  if (f.estado) p.isActive = f.estado
  return p
}

export interface BulkUploadTvInsEventoResult {
  inserted: number
  total: number
}

// ---- Actualización por Excel (solo el valor) ----
export interface UpdateRowErrorItem {
  row: number
  column: string
  reason: string
}
export interface UpdateDirect {
  row: number
  cum: string
  name: string
  value: number
  target: { id: number; name: string; value: number }
}
export interface UpdateCandidate {
  id: number
  name: string
  value: number
  concentration: string
  presentation: string
  shortName: string
}
export interface UpdateConflict {
  row: number
  cum: string
  name: string
  value: number
  candidates: UpdateCandidate[]
}
export interface UpdateMissing {
  cum: string
  name: string
  value: number
}
export interface UpdatePreview {
  directs: UpdateDirect[]
  conflicts: UpdateConflict[]
  missing: UpdateMissing[]
  errors: UpdateRowErrorItem[]
}
