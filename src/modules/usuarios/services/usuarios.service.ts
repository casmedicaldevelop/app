import { apiConfig } from '../../../config/api.config'
export const usuariosService = {
  getAll: async () => { const r = await fetch(`${apiConfig.baseUrl}/usuarios`); return r.json() },
}
