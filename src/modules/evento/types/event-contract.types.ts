export interface EventContract {
  id: number
  contractNumber: string
  startDate: string
  endDate: string
  closeDate: string | null
  totalValue: number
  contributoryValue: number
  subsidizedValue: number
  consumedTotal: number
  consumedContributory: number
  consumedSubsidized: number
  status: string // 'EN CURSO' | 'FINALIZADO'
  isOpen: boolean
}

export interface CreateEventContractPayload {
  contractNumber: string
  startDate: string
  endDate: string
  contributoryValue: number
  subsidizedValue: number
}

export interface FinalizeEventContractPayload {
  closeDate: string
}
