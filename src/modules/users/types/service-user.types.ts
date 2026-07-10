export type HealthcareRegime = 'CONTRIBUTIVO' | 'SUBSIDIADO'
export type DocumentType =
  | 'CC'
  | 'CD'
  | 'CE'
  | 'CN'
  | 'DE'
  | 'MS'
  | 'NV'
  | 'PA'
  | 'PE'
  | 'PT'
  | 'RC'
  | 'SC'
  | 'SI'
  | 'TI'
export type Gender = 'MASCULINO' | 'FEMENINO'

export interface ServiceUser {
  id: string
  documentType: DocumentType | null
  gender: Gender | null
  firstName: string
  secondName: string | null
  firstSurname: string
  secondSurname: string | null
  phone: string
  email: string | null
  birthDate: string | null
  birthDateApproximate: boolean
  healthcareRegime: HealthcareRegime | null
  department: string | null
  city: string | null
  neighborhood: string | null
  address: string | null
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateServiceUserPayload {
  id: string
  documentType?: DocumentType
  gender?: Gender
  firstName: string
  secondName?: string
  firstSurname: string
  secondSurname?: string
  phone: string
  email?: string
  birthDate?: string
  birthDateApproximate?: boolean
  healthcareRegime?: HealthcareRegime
  department?: string
  city?: string
  neighborhood?: string
  address?: string
  description?: string
}

export interface UpdateServiceUserPayload {
  documentType?: DocumentType
  gender?: Gender | null
  firstName?: string
  secondName?: string | null
  firstSurname?: string
  secondSurname?: string | null
  phone?: string
  email?: string
  birthDate?: string | null
  birthDateApproximate?: boolean
  healthcareRegime?: HealthcareRegime | null
  department?: string
  city?: string
  neighborhood?: string
  address?: string
  description?: string
  isActive?: boolean
}

export interface ListServiceUsersParams {
  search?: string
  city?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export interface PaginatedServiceUsers {
  data: ServiceUser[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface BulkImportResult {
  inserted: number
}

export interface BulkImportError {
  message: string
  duplicates: string[]
}
