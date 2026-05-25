export interface TvMed {
  id: number
  code: string
  name: string
  createdAt: string
}

export interface TvMedPage {
  data: TvMed[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateTvMedPayload {
  code: string
  name: string
}

export interface UpdateTvMedPayload {
  code?: string
  name?: string
}

export interface ListTvMedParams {
  page?: number
  limit?: number
  search?: string
}

export interface BulkUploadTvMedResult {
  inserted: number
  total: number
}
