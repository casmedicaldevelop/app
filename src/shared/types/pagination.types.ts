export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface QueryParams {
  page?: number
  limit?: number
  search?: string
}
