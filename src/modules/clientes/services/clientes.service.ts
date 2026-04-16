import { apiConfig } from '../../../config/api.config'
export const clientesService = {
  getAll: async () => { const r = await fetch(`${apiConfig.baseUrl}/clientes`); return r.json() },
  getById: async (id: string) => { const r = await fetch(`${apiConfig.baseUrl}/clientes/${id}`); return r.json() },
}
