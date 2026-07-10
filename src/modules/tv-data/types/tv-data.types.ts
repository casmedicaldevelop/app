export interface TvData {
  id: number
  code: string
  name: string
  inventoryCode: string | null
  price: number
  createdAt: string
}

export interface TvDataPage {
  data: TvData[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateTvDataPayload {
  code: string
  name: string
  inventoryCode?: string
  price: number
}

export interface UpdateTvDataPayload {
  code?: string
  name?: string
  inventoryCode?: string | null
  price?: number
}

export interface ListTvDataParams {
  page?: number
  limit?: number
  search?: string
}

export interface BulkUploadTvDataResult {
  inserted: number
  total: number
}
