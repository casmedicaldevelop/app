import { apiFetch } from '../../../lib/api-fetch'
import type { Company, UpsertCompanyPayload, UpdateMipresPayload, UpdateAiPayload } from '../types/company.types'

export const companyService = {
  async get(): Promise<Company> {
    return apiFetch<Company>('/company')
  },

  async upsert(payload: UpsertCompanyPayload): Promise<Company> {
    return apiFetch<Company>('/company', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  async updateMipres(payload: UpdateMipresPayload): Promise<Company> {
    return apiFetch<Company>('/company/mipres', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  async updateAi(payload: UpdateAiPayload): Promise<Company> {
    return apiFetch<Company>('/company/ai', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  async refreshMipresToken(): Promise<Company> {
    return apiFetch<Company>('/company/mipres/refresh-token', { method: 'POST' })
  },
}
