export interface Product {
  id: number
  code: string
  product: string
  cum: string | null
  box: number
  unit: number
  lot: string
  warehouse: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PaginatedProducts {
  data: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateProductPayload {
  code: string
  product: string
  cum?: string | null
  box: number
  unit: number
  lot: string
  warehouse: number
}

export interface UpdateProductPayload {
  product?: string
  cum?: string | null
  box?: number
  unit?: number
  lot?: string
  warehouse?: number
  isActive?: boolean
}

export interface ListProductsParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}

export interface BulkUploadResult {
  inserted: number
  skipped: number
  total: number
}

export interface CumPendingItem {
  code: string
  product: string
  affectedRows: number
}

export interface CumPendingResult {
  total: number
  next: CumPendingItem | null
}

export interface CumSuggestion {
  code: string
  product: string
  cum: string
}

export interface AssignCumPayload {
  code: string
  cum: string
}

export interface SkipCumPayload {
  code: string
}
