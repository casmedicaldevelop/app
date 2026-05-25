export interface Company {
  id: string
  name: string
  nit: string
  email: string | null
  phone: string | null
  city: string | null
  address: string | null
  codeProvider: string | null
  tokenCompany: string | null
  tokenAuth: string | null
  aiApiKey: string | null
  aiModel: string | null
  createdAt: string
  updatedAt: string
}

export interface UpsertCompanyPayload {
  name: string
  nit: string
  email?: string
  phone?: string
  city?: string
  address?: string
}

export interface UpdateMipresPayload {
  tokenCompany?: string
}

export interface UpdateAiPayload {
  aiApiKey?: string
  aiModel: string
}
