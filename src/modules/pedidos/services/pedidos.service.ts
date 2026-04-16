import { apiConfig } from '../../../config/api.config'
export const pedidosService = {
  getAll: async () => { const r = await fetch(`${apiConfig.baseUrl}/pedidos`); return r.json() },
  getById: async (id: string) => { const r = await fetch(`${apiConfig.baseUrl}/pedidos/${id}`); return r.json() },
  create: async (body: unknown) => { const r = await fetch(`${apiConfig.baseUrl}/pedidos`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) }); return r.json() },
}
