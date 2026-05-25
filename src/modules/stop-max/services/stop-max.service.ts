import { apiFetch } from '../../../lib/api-fetch'
import { apiConfig } from '../../../config/api.config'
import { useAuthStore } from '../../auth/auth.store'
import type {
  BulkUploadStopMaxResult,
  CreateStopMaxPayload,
  ListStopMaxParams,
  StopMax,
  StopMaxPage,
  UpdateStopMaxPayload,
} from '../types/stop-max.types'

export const stopMaxService = {
  async list(params: ListStopMaxParams = {}): Promise<StopMaxPage> {
    const query = new URLSearchParams()
    if (params.page)   query.set('page', String(params.page))
    if (params.limit)  query.set('limit', String(params.limit))
    if (params.search) query.set('search', params.search)
    const qs = query.toString()
    return apiFetch<StopMaxPage>(`/stop-max${qs ? `?${qs}` : ''}`)
  },

  async getById(id: number): Promise<StopMax> {
    return apiFetch<StopMax>(`/stop-max/${id}`)
  },

  async create(payload: CreateStopMaxPayload): Promise<StopMax> {
    return apiFetch<StopMax>('/stop-max', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async update(id: number, payload: UpdateStopMaxPayload): Promise<StopMax> {
    return apiFetch<StopMax>(`/stop-max/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  async remove(id: number): Promise<void> {
    return apiFetch<void>(`/stop-max/${id}`, { method: 'DELETE' })
  },

  async bulkUpload(file: File): Promise<BulkUploadStopMaxResult> {
    const { accessToken } = useAuthStore.getState()
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${apiConfig.baseUrl}/stop-max/bulk`, {
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

    return res.json() as Promise<BulkUploadStopMaxResult>
  },
}
