import { apiFetch } from '../../../lib/api-fetch'
import { apiConfig } from '../../../config/api.config'
import { useAuthStore } from '../../auth/auth.store'
import type {
  BulkUploadResult,
  CreateProductPayload,
  ListProductsParams,
  PaginatedProducts,
  Product,
  UpdateProductPayload,
} from '../types/products.types'

export const productsService = {
  async list(params: ListProductsParams = {}): Promise<PaginatedProducts> {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    if (params.search) query.set('search', params.search)
    if (params.isActive !== undefined) query.set('isActive', String(params.isActive))
    const qs = query.toString()
    return apiFetch<PaginatedProducts>(`/products${qs ? `?${qs}` : ''}`)
  },

  async getById(id: number): Promise<Product> {
    return apiFetch<Product>(`/products/${id}`)
  },

  async create(payload: CreateProductPayload): Promise<Product> {
    return apiFetch<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async update(id: number, payload: UpdateProductPayload): Promise<Product> {
    return apiFetch<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  async remove(id: number): Promise<void> {
    return apiFetch<void>(`/products/${id}`, { method: 'DELETE' })
  },

  async bulkUpload(file: File): Promise<BulkUploadResult> {
    const { accessToken } = useAuthStore.getState()
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${apiConfig.baseUrl}/products/bulk`, {
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
}
