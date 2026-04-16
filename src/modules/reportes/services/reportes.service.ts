import { apiConfig } from '../../../config/api.config'
export const reportesService = {
  getSummary: async () => { const r = await fetch(`${apiConfig.baseUrl}/reportes`); return r.json() },
}
