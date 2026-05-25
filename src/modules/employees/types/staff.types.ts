import type { Role, UserModule } from '../../auth/types/auth.types'

export interface StaffMember {
  id: string
  name: string
  email: string
  username: string
  phone: string | null
  identificationNumber: string
  role: Role
  isActive: boolean
  mustChangePassword: boolean
  createdAt: string
  updatedAt: string
  modules: UserModule[]
}

export interface CreateStaffPayload {
  name: string
  email: string
  username: string
  identificationNumber: string
  phone?: string
  role?: Role
  moduleIds?: string[]
}

export interface UpdateStaffPayload {
  name?: string
  email?: string
  username?: string
  phone?: string | null
  identificationNumber?: string
  role?: Role
  isActive?: boolean
}

export interface PaginatedStaff {
  data: StaffMember[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateStaffResponse {
  id: string
  name: string
  email: string
  username: string
  temporaryPassword: string
}

export interface ListStaffParams {
  page?: number
  limit?: number
  search?: string
  role?: Role
  isActive?: boolean
}
