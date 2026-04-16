export interface Pedido { id: string; clienteId: string; status: 'pending' | 'processing' | 'delivered'; total: number; createdAt: string }
