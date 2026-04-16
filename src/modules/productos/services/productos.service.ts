import { apiConfig } from '../../../config/api.config'
export const productosService = {
  getAll: async () => { const r = await fetch(`${apiConfig.baseUrl}/productos`); return r.json() },
}
