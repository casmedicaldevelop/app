import { apiFetch } from '../../../lib/api-fetch'
import { apiConfig } from '../../../config/api.config'
import { useAuthStore } from '../../auth/auth.store'
import type {
  BulkUploadResult,
  ListProviderProductsParams,
  Provider,
  ProviderProduct,
  ProviderProductsPage,
  UpdateProviderDto,
  UpdateProviderProductDto,
} from '../types/providers.types'

export const providersService = {
  async list(): Promise<Provider[]> {
    return apiFetch<Provider[]>('/providers')
  },

  async getById(id: number): Promise<Provider> {
    return apiFetch<Provider>(`/providers/${id}`)
  },

  async update(id: number, payload: UpdateProviderDto): Promise<Provider> {
    return apiFetch<Provider>(`/providers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  async listProducts(id: number, params: ListProviderProductsParams = {}): Promise<ProviderProductsPage> {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    if (params.search) query.set('search', params.search)
    const qs = query.toString()
    return apiFetch<ProviderProductsPage>(`/providers/${id}/products${qs ? `?${qs}` : ''}`)
  },

  async getProduct(id: number, code: string): Promise<ProviderProduct> {
    return apiFetch<ProviderProduct>(`/providers/${id}/products/${encodeURIComponent(code)}`)
  },

  async updateProduct(id: number, code: string, payload: UpdateProviderProductDto): Promise<ProviderProduct> {
    return apiFetch<ProviderProduct>(`/providers/${id}/products/${encodeURIComponent(code)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  async bulkUpload(id: number, file: File, mode: 'upload' | 'update'): Promise<BulkUploadResult> {
    const { accessToken } = useAuthStore.getState()
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mode', mode)

    const res = await fetch(`${apiConfig.baseUrl}/providers/${id}/products/bulk`, {
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

    return res.json() as Promise<BulkUploadResult>
  },

  async downloadTemplate(id: number, providerName: string): Promise<void> {
    const { accessToken } = useAuthStore.getState()
    const res = await fetch(`${apiConfig.baseUrl}/providers/${id}/products/template`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      credentials: 'include',
    })
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `plantilla_${providerName.toLowerCase()}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  },
}
