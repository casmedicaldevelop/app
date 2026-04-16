import { apiConfig } from '../../../config/api.config'
import type { KpiSummary } from '../types/dashboard.types'
export const dashboardService = {
  getSummary: async (): Promise<KpiSummary> => {
    const res = await fetch(`${apiConfig.baseUrl}/dashboard/summary`)
    if (!res.ok) throw await res.json()
    return res.json()
  },
}
