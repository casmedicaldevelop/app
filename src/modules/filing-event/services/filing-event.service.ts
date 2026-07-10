import { apiConfig } from '@/config/api.config'
import { useAuthStore } from '@/modules/auth/auth.store'
import { apiFetch, apiFetchBlob, apiFetchUpload } from '@/lib/api-fetch'

// ── Archivos (Google Drive) ───────────────────────────────────────────────────

export interface DriveFileItem {
  id: string
  name: string
  isFolder: boolean
  mimeType: string
  modifiedTime?: string
  size?: string
  childCount?: number
  folderSizeBytes?: number
}

export interface FilesListResponse {
  rootId: string
  folderId: string
  path: Array<{ id: string; name: string }>
  items: DriveFileItem[]
}

export interface FolderNode {
  id: string
  name: string
  children: FolderNode[]
}

// ── Crear (cabecera + líneas) ─────────────────────────────────────────────────

export interface CreateFilingEventItemPayload {
  cum: string
  name: string
  serviceType: 'MEDICAMENTO' | 'INSUMO'
  quantity: number
  unitValue: number
  concentration: string
  presentation: string
  administrationRoute: string
  shortName: string
  measurementUnit: number
  pharmaceuticalForm: string
  dispensingUnit: number
  frequencyPerDay: number
  treatmentDuration: number
  prescribedQuantity: number
  treatmentDays: number
}

export interface CreateFilingEventPayload {
  authorizationCode: string
  senderCode: string
  senderName: string
  doctorDocument: string
  userDocument: string
  prescriptionDate: string
  authorizationDate: string
  requestDate: string
  mainDiagnosis: string
  items: CreateFilingEventItemPayload[]
}

// ── Lista (una fila por radicación / cabecera) ────────────────────────────────

export interface FilingEventRow {
  id: number
  createdAt: string
  authorizationCode: string
  prescriptionDate: string
  authorizationDate: string
  requestDate: string
  userDocument: string
  userName: string // nombre completo ya concatenado por el backend ('' si el usuario no existe)
  userType: string | null
  totalValue: number
  status: string
  itemsCount: number
}
export interface FilingEventListResponse {
  data: FilingEventRow[]
  total: number
  page: number
  limit: number
  totalPages: number
  counts: Record<string, number>
}
export interface FilingEventListParams {
  page?: number
  limit?: number
  status?: string
  userDocument?: string
  userName?: string
  userType?: string
  authorizationCode?: string
  cum?: string
  dateExact?: string
  dateFrom?: string
  dateTo?: string
}

// ── Detalle (cabecera + líneas) ───────────────────────────────────────────────

export interface FilingEventDetailUser {
  id: string
  documentType: string | null
  firstName: string
  secondName: string | null
  firstSurname: string
  secondSurname: string | null
  gender: string | null
  birthDate: string | null
  healthcareRegime: string | null
  department: string | null
  city: string | null
  neighborhood: string | null
  address: string | null
  phone: string
  email: string | null
  description: string | null
}

export interface FilingEventItem {
  id: number
  filingEventId: number
  cum: string
  name: string
  serviceType: string | null
  quantity: number
  unitValue: number
  totalValue: number
  concentration: string
  presentation: string
  administrationRoute: string
  shortName: string
  measurementUnit: number
  pharmaceuticalForm: string
  dispensingUnit: number
  frequencyPerDay: number
  treatmentDuration: number
  prescribedQuantity: number
  treatmentDays: number
  status: string
  substatus: string | null
  deliveryDate: string | null
  opportunity: number | null
  quantityDelivered: number
  quantityPending: number
  unfulfilledQuantity: number
  statusLabel: string
  substatusLabel: string | null
  measurementUnitName: string
  dispensingUnitName: string
  pharmaceuticalFormName: string
}

export interface FilingEventDetail {
  id: number
  createdAt: string
  authorizationCode: string
  senderCode: string
  senderName: string
  userType: string | null
  doctorDocument: string
  userDocument: string
  prescriptionDate: string
  authorizationDate: string
  requestDate: string
  mainDiagnosis: string
  diagnosisDetail: string
  totalValue: number
  status: string
  statusLabel: string
  filingCode: string | null
  shelfCode: string | null
  contractId: number
  user: FilingEventDetailUser | null
  doctor: { document: string; name: string } | null
  items: FilingEventItem[]
}

// ── Entregas (por línea) ──────────────────────────────────────────────────────

export interface DeliveryEventItem {
  id: number
  deliveryNumber: number
  deliveryType: 'COMPLETA' | 'PARCIAL'
  quantityDelivered: number
  quantityPendingAfter: number
  comment: string | null
  deliveryBatch: string | null
  employeeId: string
  employeeName: string
  createdAt: string
}

export interface RegisterDeliveryEventPayload {
  deliveryType: 'COMPLETA' | 'PARCIAL' | 'SIN_EXISTENCIAS'
  quantity?: number
  comment?: string
}

/** Una entrega de la radicación (consolida todas las líneas). */
export interface FilingDeliveryRow {
  id: number
  itemId: number
  medication: string
  name: string
  cum: string
  deliveryNumber: number
  deliveryType: string
  quantityDelivered: number
  quantityPendingAfter: number
  comment: string | null
  deliveryBatch: string | null
  invoiceDate: string | null
  employeeName: string
  createdAt: string
}

export interface BulkDeliveryLine {
  itemId: number
  deliveryType: 'COMPLETA' | 'PARCIAL' | 'SIN_EXISTENCIAS'
  quantity?: number
  comment?: string
}

export interface RegisterDeliveryBulkResult {
  ok: boolean
  batchCode: string
  headerStatus: string
  lines: { itemId: number; delivered: number; pendingAfter: number; status: string; substatus: string }[]
}

export const filingEventService = {
  /** Detalle de una radicación (cabecera + líneas). */
  getById(id: number): Promise<FilingEventDetail> {
    return apiFetch<FilingEventDetail>(`/filing-event/${id}`)
  },

  /** Devuelve { id } si ya existe una radicación con ese número de autorización, o null. */
  findByAuthorization(code: string): Promise<{ id: number } | null> {
    return apiFetch<{ id: number } | null>(`/filing-event/by-authorization/${encodeURIComponent(code)}`)
  },

  /** Historial de entregas de UNA línea. */
  listDeliveries(itemId: number): Promise<DeliveryEventItem[]> {
    return apiFetch<DeliveryEventItem[]>(`/filing-event/items/${itemId}/deliveries`)
  },

  /** Todas las entregas de UNA radicación (todas sus líneas). */
  listFilingDeliveries(filingId: number): Promise<FilingDeliveryRow[]> {
    return apiFetch<FilingDeliveryRow[]>(`/filing-event/${filingId}/deliveries`)
  },

  /** Fija la fecha de factura/ticket de un lote (se guarda en todas sus filas). Formato YYYY-MM-DD. */
  setBatchInvoiceDate(
    filingId: number,
    batch: string,
    invoiceDate: string,
  ): Promise<{ ok: boolean; count: number }> {
    return apiFetch<{ ok: boolean; count: number }>(
      `/filing-event/${filingId}/batches/${encodeURIComponent(batch)}/invoice-date`,
      { method: 'PATCH', body: JSON.stringify({ invoiceDate }) },
    )
  },

  /** Asigna (o devuelve) el código de estantería de la cabecera, para el ticket. */
  assignShelfCode(id: number): Promise<{ shelfCode: string }> {
    return apiFetch<{ shelfCode: string }>(`/filing-event/${id}/shelf-code`, { method: 'POST' })
  },

  /** Registra el código de radicado en la cabecera. Solo cuando status === 'ENTREGADO'. */
  setRadicado(id: number, filingCode: string): Promise<FilingEventDetail> {
    return apiFetch<FilingEventDetail>(`/filing-event/${id}/radicado`, {
      method: 'PATCH',
      body: JSON.stringify({ filingCode }),
    })
  },

  /** Edita un valor de prescripción de UNA línea. */
  updatePrescription(
    itemId: number,
    payload: Partial<{
      frequencyPerDay: number
      treatmentDuration: number
      prescribedQuantity: number
      treatmentDays: number
    }>,
  ): Promise<FilingEventDetail> {
    return apiFetch<FilingEventDetail>(`/filing-event/items/${itemId}/prescription`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  /** Registra una entrega de UNA línea (COMPLETA / PARCIAL / SIN_EXISTENCIAS). */
  async registerDelivery(itemId: number, payload: RegisterDeliveryEventPayload): Promise<void> {
    await apiFetch(`/filing-event/items/${itemId}/deliveries`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  /** Registra la entrega de VARIAS líneas en un mismo proceso (una sola transacción). */
  registerDeliveryBulk(
    filingId: number,
    lines: BulkDeliveryLine[],
  ): Promise<RegisterDeliveryBulkResult> {
    return apiFetch<RegisterDeliveryBulkResult>(`/filing-event/${filingId}/deliveries`, {
      method: 'POST',
      body: JSON.stringify({ lines }),
    })
  },

  /** Lista las radicaciones del contrato EN CURSO. */
  list(params: FilingEventListParams = {}): Promise<FilingEventListResponse> {
    const q = new URLSearchParams()
    if (params.page) q.set('page', String(params.page))
    if (params.limit) q.set('limit', String(params.limit))
    if (params.status) q.set('status', params.status)
    if (params.userDocument?.trim()) q.set('userDocument', params.userDocument.trim())
    if (params.userName?.trim()) q.set('userName', params.userName.trim())
    if (params.userType) q.set('userType', params.userType)
    if (params.authorizationCode?.trim()) q.set('authorizationCode', params.authorizationCode.trim())
    if (params.cum?.trim()) q.set('cum', params.cum.trim())
    if (params.dateExact) q.set('dateExact', params.dateExact)
    if (params.dateFrom) q.set('dateFrom', params.dateFrom)
    if (params.dateTo) q.set('dateTo', params.dateTo)
    const qs = q.toString()
    return apiFetch<FilingEventListResponse>(`/filing-event${qs ? `?${qs}` : ''}`)
  },

  /** Crea la radicación de evento (cabecera + líneas). */
  create(payload: CreateFilingEventPayload): Promise<{ id: number }> {
    return apiFetch<{ id: number }>('/filing-event', { method: 'POST', body: JSON.stringify(payload) })
  },

  // ===== Gestor de archivos por radicado de evento (Drive directo) =====

  /** Contenido de la raíz FILING_EVENT/{códigoAutorización} (la asegura si no existe). */
  filesRoot(id: number): Promise<FilesListResponse> {
    return apiFetch<FilesListResponse>(`/filing-event/${id}/files`)
  },

  /** Contenido de una subcarpeta. */
  filesList(id: number, folderId: string): Promise<FilesListResponse> {
    return apiFetch<FilesListResponse>(`/filing-event/${id}/files/${folderId}`)
  },

  /** Árbol completo de carpetas del radicado. */
  filesTree(id: number): Promise<{ rootId: string; tree: FolderNode[] }> {
    return apiFetch<{ rootId: string; tree: FolderNode[] }>(`/filing-event/${id}/files-tree`)
  },

  createFolder(id: number, folderId: string, name: string): Promise<DriveFileItem> {
    return apiFetch<DriveFileItem>(`/filing-event/${id}/files/${folderId}/folders`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  },

  uploadFile(id: number, folderId: string, file: File): Promise<DriveFileItem> {
    const form = new FormData()
    form.append('file', file)
    return apiFetchUpload<DriveFileItem>(`/filing-event/${id}/files/${folderId}`, form)
  },

  async deleteItem(id: number, itemId: string): Promise<void> {
    await apiFetch(`/filing-event/${id}/files/${itemId}`, { method: 'DELETE' })
  },

  /** Blob del archivo para previsualizar/descargar. */
  fileBlob(
    id: number,
    itemId: string,
    disposition: 'inline' | 'attachment' = 'inline',
  ): Promise<Blob> {
    return apiFetchBlob(`/filing-event/${id}/files/${itemId}/content?disposition=${disposition}`)
  },

  /** Cuota del Drive: total (limitBytes) y usado (usageBytes). */
  driveQuota(): Promise<{ limitBytes: number | null; usageBytes: number }> {
    return apiFetch<{ limitBytes: number | null; usageBytes: number }>(`/filing-event/drive-quota`)
  },

  /** Exporta a Excel todos los registros del filtro (una fila por medicamento/insumo). */
  exportExcel(params: FilingEventListParams = {}): Promise<Blob> {
    const q = new URLSearchParams()
    if (params.status) q.set('status', params.status)
    if (params.userDocument?.trim()) q.set('userDocument', params.userDocument.trim())
    if (params.userName?.trim()) q.set('userName', params.userName.trim())
    if (params.userType) q.set('userType', params.userType)
    if (params.authorizationCode?.trim()) q.set('authorizationCode', params.authorizationCode.trim())
    if (params.cum?.trim()) q.set('cum', params.cum.trim())
    if (params.dateExact) q.set('dateExact', params.dateExact)
    if (params.dateFrom) q.set('dateFrom', params.dateFrom)
    if (params.dateTo) q.set('dateTo', params.dateTo)
    const qs = q.toString()
    return apiFetchBlob(`/filing-event/export${qs ? `?${qs}` : ''}`)
  },

  /** Sube un PDF de autorización y devuelve la información extraída por la IA. */
  async ocr(file: File): Promise<{ data: unknown }> {
    const { accessToken } = useAuthStore.getState()
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${apiConfig.baseUrl}/filing-event/ocr`, {
      method: 'POST',
      headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: formData,
      credentials: 'include',
    })
    if (!res.ok) throw await res.json().catch(() => ({ message: res.statusText }))
    return res.json() as Promise<{ data: unknown }>
  },
}
