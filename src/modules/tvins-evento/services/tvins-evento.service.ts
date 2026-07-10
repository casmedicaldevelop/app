import { apiFetch } from '../../../lib/api-fetch'
import { apiConfig } from '../../../config/api.config'
import { useAuthStore } from '../../auth/auth.store'
import type {
  BulkUploadTvInsEventoResult,
  CreateTvInsEventoPayload,
  ListTvInsEventoParams,
  MeasurementUnit,
  PharmaceuticalForm,
  ScientificUnit,
  TvInsEvento,
  UpdatePreview,
  TvInsEventoPage,
  UpdateTvInsEventoPayload,
} from '../types/tvins-evento.types'

export const tvInsEventoService = {
  async list(params: ListTvInsEventoParams = {}): Promise<TvInsEventoPage> {
    const q = new URLSearchParams()
    if (params.page) q.set('page', String(params.page))
    if (params.limit) q.set('limit', String(params.limit))
    if (params.cum) q.set('cum', params.cum)
    if (params.name) q.set('name', params.name)
    if (params.isActive) q.set('isActive', params.isActive)
    const qs = q.toString()
    return apiFetch<TvInsEventoPage>(`/tvins-evento${qs ? `?${qs}` : ''}`)
  },

  async create(payload: CreateTvInsEventoPayload): Promise<TvInsEvento> {
    return apiFetch<TvInsEvento>('/tvins-evento', { method: 'POST', body: JSON.stringify(payload) })
  },

  async update(id: number, payload: UpdateTvInsEventoPayload): Promise<TvInsEvento> {
    return apiFetch<TvInsEvento>(`/tvins-evento/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
  },

  async remove(id: number): Promise<void> {
    return apiFetch<void>(`/tvins-evento/${id}`, { method: 'DELETE' })
  },

  async bulkUpload(file: File): Promise<BulkUploadTvInsEventoResult> {
    const { accessToken } = useAuthStore.getState()
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${apiConfig.baseUrl}/tvins-evento/bulk`, {
      method: 'POST',
      headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: formData,
      credentials: 'include',
    })
    if (!res.ok) {
      throw await res.json().catch(() => ({ message: res.statusText }))
    }
    return res.json() as Promise<BulkUploadTvInsEventoResult>
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
    const res = await fetch(`${apiConfig.baseUrl}/tvins-evento/update/preview`, {
      method: 'POST',
      headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: formData,
      credentials: 'include',
    })
    if (!res.ok) throw await res.json().catch(() => ({ message: res.statusText }))
    return res.json() as Promise<UpdatePreview>
  },

  async updateApply(items: { id: number; value: number }[]): Promise<{ updated: number }> {
    return apiFetch<{ updated: number }>('/tvins-evento/update/apply', {
      method: 'POST',
      body: JSON.stringify({ items }),
    })
  },
}
