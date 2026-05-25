import { apiFetch } from '../../../lib/api-fetch'
import { apiConfig } from '../../../config/api.config'
import { useAuthStore } from '../../auth/auth.store'
import type {
  BulkUploadTvMedResult,
  CreateTvMedPayload,
  ListTvMedParams,
  TvMed,
  TvMedPage,
  UpdateTvMedPayload,
} from '../types/tv-med.types'

export const tvMedService = {
  async list(params: ListTvMedParams = {}): Promise<TvMedPage> {
    const query = new URLSearchParams()
    if (params.page)   query.set('page', String(params.page))
    if (params.limit)  query.set('limit', String(params.limit))
    if (params.search) query.set('search', params.search)
    const qs = query.toString()
    return apiFetch<TvMedPage>(`/tv-med${qs ? `?${qs}` : ''}`)
  },

  async getById(id: number): Promise<TvMed> {
    return apiFetch<TvMed>(`/tv-med/${id}`)
  },

  async create(payload: CreateTvMedPayload): Promise<TvMed> {
    return apiFetch<TvMed>('/tv-med', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async update(id: number, payload: UpdateTvMedPayload): Promise<TvMed> {
    return apiFetch<TvMed>(`/tv-med/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  async remove(id: number): Promise<void> {
    return apiFetch<void>(`/tv-med/${id}`, { method: 'DELETE' })
  },

  async bulkUpload(file: File): Promise<BulkUploadTvMedResult> {
    const { accessToken } = useAuthStore.getState()
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${apiConfig.baseUrl}/tv-med/bulk`, {
      method: 'POST',
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: formData,
      credentials: 'include',
    })

    if (!res.ok) {
      throw await res.json().catch(() => ({ message: res.statusText }))
    }

    return res.json() as Promise<BulkUploadTvMedResult>
  },
}
