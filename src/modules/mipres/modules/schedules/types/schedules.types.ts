export interface ScheduleItem {
  ID: number
  IDProgramacion: number
  NoPrescripcion: string
  TipoTec: string
  ConTec: number
  TipoIDPaciente: string
  NoIDPaciente: string
  NoEntrega: number
  FecMaxEnt: string
  TipoIDSedeProv: string
  NoIDSedeProv: string
  CodSedeProv: string
  CodSerTecAEntregar: string
  CantTotAEntregar: string
  FecProgramacion: string
  EstProgramacion: number
  FecAnulacion: string | null
}

export interface CreateSchedulePayload {
  miPresDireccionId: string
  fecMaxEnt: string
  tipoIdSedeProv: string
  noIdSedeProv: string
  codSedeProv: string
  codSerTecAEntregar: string
  cantTotAEntregar: string
  // Radicado: persistido en backend tras respuesta correcta de SISPRO.
  doctorDocument: string
  userDocument: string
  prescriptionNumber: string
  medicationName: string
  inventoryCode: string | null
  unitPrice: number
}

export interface CreateScheduleResponse {
  sispro: unknown
  radicado: {
    id: number
    scheduleId: string
    status: string
    [key: string]: unknown
  }
}
