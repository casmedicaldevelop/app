import { apiFetch } from '../../../lib/api-fetch'
import type {
  AssignCumPayload,
  CumPendingResult,
  CumSuggestion,
  SkipCumPayload,
} from '../types/products.types'

export const cumMatchingService = {
  async getPendingProvider1(): Promise<CumPendingResult> {
    return apiFetch<CumPendingResult>('/products/cum-matching/provider1/pending')
  },

  async getSuggestionsProvider1(q: string): Promise<CumSuggestion[]> {
    return apiFetch<CumSuggestion[]>(
      `/products/cum-matching/provider1/suggestions?q=${encodeURIComponent(q)}`,
    )
  },

  async assignCumProvider1(payload: AssignCumPayload): Promise<{ updated: number }> {
    return apiFetch<{ updated: number }>('/products/cum-matching/provider1/assign', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async skipCumProvider1(payload: SkipCumPayload): Promise<{ updated: number }> {
    return apiFetch<{ updated: number }>('/products/cum-matching/provider1/skip', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}
