export interface EntregaItem {
  ID: number
  IDEntrega: number
  NoPrescripcion: string
  TipoTec: string
  ConTec: number
  TipoIDPaciente: string
  NoIDPaciente: string
  NoEntrega: number
  CodSerTecEntregado: string
  CantTotEntregada: string
  EntTotal: number
  CausaNoEntrega: number | null
  FecEntrega: string
  NoLote: string
  TipoIDRecibe: string
  NoIDRecibe: string
  EstEntrega: number
  FecAnulacion: string | null
  CodigosEntrega: unknown
}

export interface CreateDeliveryPayload {
  miPresDireccionId: string
  codSerTecEntregado: string
  cantTotEntregada: string
  entTotal: number
  causaNoEntrega: number
  fecEntrega: string
  noLote: string
  tipoIdRecibe: string
  noIdRecibe: string
}

export interface CreateDeliveryReportPayload {
  miPresEntregaId: string
  valorEntregado: string
}
