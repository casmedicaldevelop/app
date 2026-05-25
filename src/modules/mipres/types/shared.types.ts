import type { ServiceUser } from '../../users/types/service-user.types'
import type { RoutingItem } from '../modules/routings/types/routings.types'

export interface MipresFromPrescription {
  tipoDoc: string
  noDoc: string
  address: string
}

export type PatientResolution =
  | { exists: true; user: ServiceUser; tipoDoc: string }
  | { exists: false; fromMipres: MipresFromPrescription }

export interface WorkspaceResponse {
  prescriptionNumber: string
  routings: RoutingItem[]
  patient: PatientResolution | null
}

export type MipresTool = 'routings' | 'schedules' | 'entregas' | 'delivery-reports' | 'facturacion'
