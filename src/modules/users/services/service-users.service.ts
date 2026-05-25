import { apiFetch } from '../../../lib/api-fetch'
import { apiConfig } from '../../../config/api.config'
import { useAuthStore } from '../../auth/auth.store'
import type {
  BulkImportResult,
  CreateServiceUserPayload,
  ListServiceUsersParams,
  PaginatedServiceUsers,
  ServiceUser,
  UpdateServiceUserPayload,
} from '../types/service-user.types'

export const serviceUsersService = {
  async list(params: ListServiceUsersParams = {}): Promise<PaginatedServiceUsers> {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    if (params.search) query.set('search', params.search)
    if (params.city) query.set('city', params.city)
    if (params.isActive !== undefined) query.set('isActive', String(params.isActive))
    const qs = query.toString()
    return apiFetch<PaginatedServiceUsers>(`/users${qs ? `?${qs}` : ''}`)
  },

  async getById(id: string): Promise<ServiceUser> {
    return apiFetch<ServiceUser>(`/users/${encodeURIComponent(id)}`)
  },

  async create(payload: CreateServiceUserPayload): Promise<ServiceUser> {
    return apiFetch<ServiceUser>('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async update(id: string, payload: UpdateServiceUserPayload): Promise<ServiceUser> {
    return apiFetch<ServiceUser>(`/users/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  async bulkImport(file: File): Promise<BulkImportResult> {
    const { accessToken } = useAuthStore.getState()
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${apiConfig.baseUrl}/users/bulk`, {
      method: 'POST',
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: formData,
      credentials: 'include',
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }))
      throw err
    }

    return res.json() as Promise<BulkImportResult>
  },

  async downloadTemplate(): Promise<void> {
    const { accessToken } = useAuthStore.getState()
    const res = await fetch(`${apiConfig.baseUrl}/users/bulk/template`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      credentials: 'include',
    })
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plantilla_usuarios.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  },
}
