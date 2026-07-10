import { apiFetch } from '../../../lib/api-fetch'

export interface Diagnosis {
  code: string
  description: string
}

export const diagnosesLookup = {
  /** Busca diagnósticos CIE-10 por código o descripción. */
  search(q: string): Promise<Diagnosis[]> {
    return apiFetch<Diagnosis[]>(`/diagnoses?search=${encodeURIComponent(q)}&limit=20`)
  },
}
