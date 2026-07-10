import { apiFetch } from '../../../lib/api-fetch'
import { apiConfig } from '../../../config/api.config'
import { useAuthStore } from '../../auth/auth.store'
import type {
  BulkUploadTvMedEventoResult,
  CreateTvMedEventoPayload,
  ListTvMedEventoParams,
  MeasurementUnit,
  PharmaceuticalForm,
  ScientificUnit,
  TvMedEvento,
  UpdatePreview,
  TvMedEventoPage,
  UpdateTvMedEventoPayload,
} from '../types/tvmed-evento.types'

export const tvMedEventoService = {
  async list(params: ListTvMedEventoParams = {}): Promise<TvMedEventoPage> {
    const q = new URLSearchParams()
    if (params.page) q.set('page', String(params.page))
    if (params.limit) q.set('limit', String(params.limit))
    if (params.cum) q.set('cum', params.cum)
    if (params.name) q.set('name', params.name)
    if (params.isActive) q.set('isActive', params.isActive)
    const qs = q.toString()
    return apiFetch<TvMedEventoPage>(`/tvmed-evento${qs ? `?${qs}` : ''}`)
  },

  async create(payload: CreateTvMedEventoPayload): Promise<TvMedEvento> {
    return apiFetch<TvMedEvento>('/tvmed-evento', { method: 'POST', body: JSON.stringify(payload) })
  },

  async update(id: number, payload: UpdateTvMedEventoPayload): Promise<TvMedEvento> {
    return apiFetch<TvMedEvento>(`/tvmed-evento/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
  },

  async remove(id: number): Promise<void> {
    return apiFetch<void>(`/tvmed-evento/${id}`, { method: 'DELETE' })
  },

  async bulkUpload(file: File): Promise<BulkUploadTvMedEventoResult> {
    const { accessToken } = useAuthStore.getState()
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${apiConfig.baseUrl}/tvmed-evento/bulk`, {
      method: 'POST',
      headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: formData,
      credentials: 'include',
    })
    if (!res.ok) {
      throw await res.json().catch(() => ({ message: res.statusText }))
    }
    return res.json() as Promise<BulkUploadTvMedEventoResult>
  },

  // Catálogos de referencia (lectura) para los desplegables.
  async measurementUnits(): Promise<MeasurementUnit[]> {
    return apiFetch<MeasurementUnit[]>('/catalogs/measurement-units')
  },

  async pharmaceuticalForms(): Promise<PharmaceuticalForm[]> {
    return apiFetch<PharmaceuticalForm[]>('/catalogs/pharmaceutical-forms')
  },

  async scientificUnits(): Promise<ScientificUnit[]> {
    return apiFetch<ScientificUnit[]>('/catalogs/scientific-units')
  },

  // Actualización por Excel (solo el valor).
  async updatePreview(file: File): Promise<UpdatePreview> {
    const { accessToken } = useAuthStore.getState()
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${apiConfig.baseUrl}/tvmed-evento/update/preview`, {
      method: 'POST',
      headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: formData,
      credentials: 'include',
    })
    if (!res.ok) throw await res.json().catch(() => ({ message: res.statusText }))
    return res.json() as Promise<UpdatePreview>
  },

  async updateApply(items: { id: number; value: number }[]): Promise<{ updated: number }> {
    return apiFetch<{ updated: number }>('/tvmed-evento/update/apply', {
      method: 'POST',
      body: JSON.stringify({ items }),
    })
  },
}
