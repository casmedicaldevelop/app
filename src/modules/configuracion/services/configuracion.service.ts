import { apiConfig } from '../../../config/api.config'
export const configuracionService = {
  get: async () => { const r = await fetch(`${apiConfig.baseUrl}/configuracion`); return r.json() },
}
