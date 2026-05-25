export interface Provider {
  id: number
  name: string
  tableKey: string
  address: string | null
  phone: string | null
  description: string | null
  updatedAt: string
}

export interface ProviderProduct {
  code: string
  product: string
  iva: boolean
  cum: string | null
  priceBox: number
  priceUnit: number
  stopBox: number
}

export interface ProviderProductsPage {
  data: ProviderProduct[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UpdateProviderDto {
  address?: string | null
  phone?: string | null
  description?: string | null
}

export interface UpdateProviderProductDto {
  product?: string
  iva?: boolean
  cum?: string | null
  priceBox?: number
  priceUnit?: number
  stopBox?: number
}

export interface BulkUploadResult {
  inserted: number
  updated: number
  total: number
  mode: 'upload' | 'update'
}

export interface ListProviderProductsParams {
  page?: number
  limit?: number
  search?: string
}
