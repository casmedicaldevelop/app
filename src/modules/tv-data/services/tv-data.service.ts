import { apiFetch } from '../../../lib/api-fetch'
import { apiConfig } from '../../../config/api.config'
import { useAuthStore } from '../../auth/auth.store'
import type {
  BulkUploadTvDataResult,
  CreateTvDataPayload,
  ListTvDataParams,
  TvData,
  TvDataPage,
  UpdateTvDataPayload,
} from '../types/tv-data.types'

export const tvDataService = {
  async list(params: ListTvDataParams = {}): Promise<TvDataPage> {
    const query = new URLSearchParams()
    if (params.page)   query.set('page', String(params.page))
    if (params.limit)  query.set('limit', String(params.limit))
    if (params.search) query.set('search', params.search)
    const qs = query.toString()
    return apiFetch<TvDataPage>(`/tv-data${qs ? `?${qs}` : ''}`)
  },

  async getById(id: number): Promise<TvData> {
    return apiFetch<TvData>(`/tv-data/${id}`)
  },

  async create(payload: CreateTvDataPayload): Promise<TvData> {
    return apiFetch<TvData>('/tv-data', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async update(id: number, payload: UpdateTvDataPayload): Promise<TvData> {
    return apiFetch<TvData>(`/tv-data/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  async remove(id: number): Promise<void> {
    return apiFetch<void>(`/tv-data/${id}`, { method: 'DELETE' })
  },

  async bulkUpload(file: File): Promise<BulkUploadTvDataResult> {
    const { accessToken } = useAuthStore.getState()
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${apiConfig.baseUrl}/tv-data/bulk`, {
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

    return res.json() as Promise<BulkUploadTvDataResult>
  },
}
