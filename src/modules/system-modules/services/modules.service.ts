import { apiFetch } from '../../../lib/api-fetch'
import type {
  CreateModulePayload,
  ReorderModulesPayload,
  SystemModule,
  UpdateModulePayload,
} from '../types/modules.types'

export const modulesService = {
  async list(params: { isActive?: boolean } = {}): Promise<SystemModule[]> {
    const query = new URLSearchParams()
    if (params.isActive !== undefined) query.set('isActive', String(params.isActive))
    const qs = query.toString()
    return apiFetch<SystemModule[]>(`/modules${qs ? `?${qs}` : ''}`)
  },

  async getById(id: string): Promise<SystemModule> {
    return apiFetch<SystemModule>(`/modules/${id}`)
  },

  async create(payload: CreateModulePayload): Promise<SystemModule> {
    return apiFetch<SystemModule>('/modules', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async update(id: string, payload: UpdateModulePayload): Promise<SystemModule> {
    return apiFetch<SystemModule>(`/modules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  async delete(id: string): Promise<void> {
    await apiFetch<void>(`/modules/${id}`, { method: 'DELETE' })
  },

  async reorder(payload: ReorderModulesPayload): Promise<void> {
    await apiFetch<void>('/modules/reorder', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
}
