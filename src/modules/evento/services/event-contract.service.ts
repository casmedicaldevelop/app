import { apiFetch } from '../../../lib/api-fetch'
import type {
  CreateEventContractPayload,
  EventContract,
  FinalizeEventContractPayload,
} from '../types/event-contract.types'

export const eventContractService = {
  async list(): Promise<EventContract[]> {
    return apiFetch<EventContract[]>('/event-contract')
  },

  async getById(id: number): Promise<EventContract> {
    return apiFetch<EventContract>(`/event-contract/${id}`)
  },

  async active(): Promise<EventContract | null> {
    return apiFetch<EventContract | null>('/event-contract/active')
  },

  async create(payload: CreateEventContractPayload): Promise<EventContract> {
    return apiFetch<EventContract>('/event-contract', { method: 'POST', body: JSON.stringify(payload) })
  },

  async finalize(id: number, payload: FinalizeEventContractPayload): Promise<EventContract> {
    return apiFetch<EventContract>(`/event-contract/${id}/finalize`, { method: 'PATCH', body: JSON.stringify(payload) })
  },

  async setOpen(id: number, isOpen: boolean): Promise<EventContract> {
    return apiFetch<EventContract>(`/event-contract/${id}/open`, { method: 'PATCH', body: JSON.stringify({ isOpen }) })
  },
}
