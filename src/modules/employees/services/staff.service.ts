import { apiFetch } from '../../../lib/api-fetch'
import type {
  CreateStaffPayload,
  CreateStaffResponse,
  ListStaffParams,
  PaginatedStaff,
  StaffMember,
  UpdateStaffPayload,
} from '../types/staff.types'
import type { UserModule } from '../../auth/types/auth.types'

export const staffService = {
  async list(params: ListStaffParams = {}): Promise<PaginatedStaff> {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    if (params.search) query.set('search', params.search)
    if (params.role) query.set('role', params.role)
    if (params.isActive !== undefined) query.set('isActive', String(params.isActive))
    const qs = query.toString()
    return apiFetch<PaginatedStaff>(`/employees${qs ? `?${qs}` : ''}`)
  },

  async getById(id: string): Promise<StaffMember> {
    return apiFetch<StaffMember>(`/employees/${id}`)
  },

  async create(payload: CreateStaffPayload): Promise<CreateStaffResponse> {
    return apiFetch<CreateStaffResponse>('/employees', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async update(id: string, payload: UpdateStaffPayload): Promise<StaffMember> {
    return apiFetch<StaffMember>(`/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  async assignModules(id: string, moduleIds: string[]): Promise<{ message: string; modules: UserModule[] }> {
    return apiFetch(`/employees/${id}/modules`, {
      method: 'POST',
      body: JSON.stringify({ moduleIds }),
    })
  },
}
