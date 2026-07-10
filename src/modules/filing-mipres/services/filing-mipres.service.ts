import { apiFetch, apiFetchBlob, apiFetchUpload } from '../../../lib/api-fetch'
import type {
  ListFilingParams,
  FilingListResponse,
  FilingDetail,
  DeliveryItem,
  RegisterDeliveryPayload,
  UpdateRadicacionPayload,
} from '../types/filing-mipres.types'

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

export const filingMipresService = {
  async list(params: ListFilingParams = {}): Promise<FilingListResponse> {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    if (params.filingCode) query.set('filingCode', params.filingCode)
    if (params.userDocument) query.set('userDocument', params.userDocument)
    if (params.prescriptionNumber) query.set('prescriptionNumber', params.prescriptionNumber)
    if (params.status) query.set('status', params.status)
    if (params.dateExact) query.set('dateExact', params.dateExact)
    if (params.dateFrom) query.set('dateFrom', params.dateFrom)
    if (params.dateTo) query.set('dateTo', params.dateTo)
    const qs = query.toString()
    return apiFetch<FilingListResponse>(`/filing-mipres${qs ? `?${qs}` : ''}`)
  },

  async getById(id: number): Promise<FilingDetail> {
    return apiFetch<FilingDetail>(`/filing-mipres/${id}`)
  },

  /** Busca el id del radicado por schedule_id (IDProgramacion). 404 si no existe. */
  async findIdBySchedule(scheduleId: string): Promise<{ id: number }> {
    return apiFetch<{ id: number }>(
      `/filing-mipres/by-schedule/${encodeURIComponent(scheduleId)}`,
    )
  },

  /** Exporta a Excel todos los registros que cumplen el filtro (sin paginar). */
  async exportExcel(params: ListFilingParams = {}): Promise<Blob> {
    const query = new URLSearchParams()
    if (params.filingCode) query.set('filingCode', params.filingCode)
    if (params.userDocument) query.set('userDocument', params.userDocument)
    if (params.prescriptionNumber) query.set('prescriptionNumber', params.prescriptionNumber)
    if (params.status) query.set('status', params.status)
    if (params.dateExact) query.set('dateExact', params.dateExact)
    if (params.dateFrom) query.set('dateFrom', params.dateFrom)
    if (params.dateTo) query.set('dateTo', params.dateTo)
    const qs = query.toString()
    return apiFetchBlob(`/filing-mipres/export${qs ? `?${qs}` : ''}`)
  },

  async listDeliveries(id: number): Promise<DeliveryItem[]> {
    return apiFetch<DeliveryItem[]>(`/filing-mipres/${id}/deliveries`)
  },

  /** Asigna (o devuelve) el código de estantería del radicado para el ticket. */
  async assignShelfCode(id: number): Promise<{ shelfCode: string }> {
    return apiFetch<{ shelfCode: string }>(`/filing-mipres/${id}/shelf-code`, { method: 'POST' })
  },

  async registerDelivery(id: number, payload: RegisterDeliveryPayload): Promise<void> {
    await apiFetch(`/filing-mipres/${id}/deliveries`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async updateRadicacion(id: number, payload: UpdateRadicacionPayload): Promise<FilingDetail> {
    return apiFetch<FilingDetail>(`/filing-mipres/${id}/radicacion`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  // ===== Gestor de archivos por radicado (Drive directo) =====

  /** Contenido de la raíz FILING_MIPRES/{id} (la asegura si no existe). */
  async filesRoot(id: number): Promise<FilesListResponse> {
    return apiFetch<FilesListResponse>(`/filing-mipres/${id}/files`)
  },

  /** Contenido de una subcarpeta. */
  async filesList(id: number, folderId: string): Promise<FilesListResponse> {
    return apiFetch<FilesListResponse>(`/filing-mipres/${id}/files/${folderId}`)
  },

  /** Árbol completo de carpetas del radicado (barrido recursivo, una sola vez). */
  async filesTree(id: number): Promise<{ rootId: string; tree: FolderNode[] }> {
    return apiFetch<{ rootId: string; tree: FolderNode[] }>(`/filing-mipres/${id}/files-tree`)
  },

  async createFolder(id: number, folderId: string, name: string): Promise<DriveFileItem> {
    return apiFetch<DriveFileItem>(`/filing-mipres/${id}/files/${folderId}/folders`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  },

  async uploadFile(id: number, folderId: string, file: File): Promise<DriveFileItem> {
    const form = new FormData()
    form.append('file', file)
    return apiFetchUpload<DriveFileItem>(`/filing-mipres/${id}/files/${folderId}`, form)
  },

  async deleteItem(id: number, itemId: string): Promise<void> {
    await apiFetch(`/filing-mipres/${id}/files/${itemId}`, { method: 'DELETE' })
  },

  /** Blob del archivo para previsualizar/descargar. */
  async fileBlob(
    id: number,
    itemId: string,
    disposition: 'inline' | 'attachment' = 'inline',
  ): Promise<Blob> {
    return apiFetchBlob(`/filing-mipres/${id}/files/${itemId}/content?disposition=${disposition}`)
  },

  /** Cuota del Drive: total (limitBytes) y usado (usageBytes). */
  async driveQuota(): Promise<{ limitBytes: number | null; usageBytes: number }> {
    return apiFetch<{ limitBytes: number | null; usageBytes: number }>(`/filing-mipres/drive-quota`)
  },
}
