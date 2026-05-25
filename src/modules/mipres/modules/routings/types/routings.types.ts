export interface RoutingItem {
  ID: number
  IDDireccionamiento: number
  NoPrescripcion: string
  TipoTec: string
  ConTec: number
  TipoIDPaciente: string
  NoIDPaciente: string
  NoEntrega: number
  NoSubEntrega: number
  TipoIDProv: string
  NoIDProv: string
  CodMunEnt: string
  FecMaxEnt: string
  CantTotAEntregar: string
  DirPaciente: string
  CodSerTecAEntregar: string
  NoIDEPS: string
  CodEPS: string
  FecDireccionamiento: string
  EstDireccionamiento: number
  FecAnulacion: string | null
}
