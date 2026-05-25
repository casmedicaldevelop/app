export interface StopMax {
  id: number
  product: string
  cum: string | null
  price: number
  createdAt: string
  updatedAt: string
}

export interface StopMaxPage {
  data: StopMax[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateStopMaxPayload {
  product: string
  cum?: string | null
  price: number
}

export interface UpdateStopMaxPayload {
  product?: string
  cum?: string | null
  price?: number
}

export interface ListStopMaxParams {
  page?: number
  limit?: number
  search?: string
}

export interface BulkUploadStopMaxResult {
  inserted: number
  total: number
}
