import type { PaginatedResponse } from '../../../shared/types/pagination.types'

/** Fila de radicación tal como la devuelve el backend (BigInt serializados a string). */
export interface Filing {
  id: number
  filingCode: string | null
  userDocument: string
  prescriptionNumber: string
  scheduleId: string
  technologyCode: string
  medicationName: string
  quantityToDeliver: number
  quantityDelivered: number
  status: string
  substatus: string | null
  createdAt: string
}

/** Estado de los filtros tal como vive en el drawer (todos los campos siempre presentes). */
export interface FilingFilters {
  filingCode: string
  userDocument: string
  prescriptionNumber: string
  status: string // '' = Todos
  dateMode: 'exacta' | 'rango'
  dateExact: string
  dateFrom: string
  dateTo: string
}

export const EMPTY_FILTERS: FilingFilters = {
  filingCode: '',
  userDocument: '',
  prescriptionNumber: '',
  status: '',
  dateMode: 'rango',
  dateExact: '',
  dateFrom: '',
  dateTo: '',
}

/** Query params que viajan al backend. Fecha: dateExact O dateFrom/dateTo, nunca ambos. */
export interface ListFilingParams {
  page?: number
  limit?: number
  filingCode?: string
  userDocument?: string
  prescriptionNumber?: string
  status?: string
  dateExact?: string
  dateFrom?: string
  dateTo?: string
}

/** Agregados que se recalculan según el filtro (vienen del backend, no de la página). */
export interface FilingSummary {
  total: number
  pendiente: number
  entregado: number
  parcial: number
  totalAmount: number
  filingAmount: number
  faltaAmount: number
  filingCount: number
  faltaCount: number
}

export type FilingListResponse = PaginatedResponse<Filing> & {
  summary: FilingSummary
}

// ── Detalle ────────────────────────────────────────────────────────────────

export interface FilingPatient {
  document: string
  documentType: string | null
  firstName: string
  secondName: string | null
  firstSurname: string
  secondSurname: string | null
  gender: string | null
  birthDate: string | null
  healthcareRegime: string | null
  phone: string | null
  email: string | null
  city: string | null
  neighborhood: string | null
  address: string | null
}

export interface FilingDetail {
  id: number
  filingCode: string | null
  userDocument: string
  doctorDocument: string
  prescriptionNumber: string
  scheduleId: string
  deliveryId: string | null
  deliveryReportId: string | null
  billingId: string | null
  invoiceCode: string | null
  invoiceDate: string | null
  technologyCode: string
  inventoryCode: string | null
  medicationName: string
  quantityToDeliver: number
  unitPrice: number
  totalPrice: number
  deliveryDate: string | null
  maxDeliveryDate: string
  cufe: string | null
  shelfCode: string | null
  status: string
  substatus: string | null
  quantityPending: number
  quantityDelivered: number
  createdAt: string
  updatedAt: string
  statusLabel: string | null
  substatusLabel: string | null
  patient: FilingPatient | null
  doctor: { document: string; name: string } | null
  tvData: { code: string; name: string; inventoryCode: string | null; price: number } | null
}

// ── Entregas ─────────────────────────────────────────────────────────────────

export interface DeliveryItem {
  id: number
  deliveryNumber: number
  deliveryType: 'COMPLETA' | 'PARCIAL'
  quantityDelivered: number
  quantityPendingAfter: number
  comment: string | null
  employeeId: string
  employeeName: string
  createdAt: string
}

export interface RegisterDeliveryPayload {
  deliveryType: 'COMPLETA' | 'PARCIAL' | 'SIN_EXISTENCIAS'
  quantity?: number
  comment?: string
}

/** Cierre de radicación: F. Factura (invoiceDate), CUFE, Radicado (filingCode). */
export interface UpdateRadicacionPayload {
  invoiceDate: string
  cufe: string
  filingCode: string
}

/** Cuenta cuántos filtros están activos (para el badge del botón Filtros). */
export function countActiveFilters(f: FilingFilters): number {
  let n = 0
  if (f.filingCode.trim()) n++
  if (f.userDocument.trim()) n++
  if (f.prescriptionNumber.trim()) n++
  if (f.status) n++
  if (f.dateMode === 'exacta' ? f.dateExact : f.dateFrom || f.dateTo) n++
  return n
}

/** Traduce el estado del drawer a los query params del backend. */
export function filtersToParams(f: FilingFilters): ListFilingParams {
  const params: ListFilingParams = {}
  if (f.filingCode.trim()) params.filingCode = f.filingCode.trim()
  if (f.userDocument.trim()) params.userDocument = f.userDocument.trim()
  if (f.prescriptionNumber.trim()) params.prescriptionNumber = f.prescriptionNumber.trim()
  if (f.status) params.status = f.status
  if (f.dateMode === 'exacta') {
    if (f.dateExact) params.dateExact = f.dateExact
  } else {
    if (f.dateFrom) params.dateFrom = f.dateFrom
    if (f.dateTo) params.dateTo = f.dateTo
  }
  return params
}
