/**
 * Schema real verificado con sample JSON de SISPRO.
 * `IDReporteEntrega` es la PK del reporte (se pasa al endpoint Anular).
 * `ID` es la FK que apunta al `ID` de la entrega reportada.
 * `FecAnulacion === null` indica reporte activo.
 */
export interface ReporteEntregaItem {
  ID: number
  IDReporteEntrega: number
  NoPrescripcion: string
  TipoTec: string
  ConTec: number
  TipoIDPaciente: string
  NoIDPaciente: string
  NoEntrega: number
  EstadoEntrega: number
  CausaNoEntrega: number | null
  ValorEntregado: number
  CodTecEntregado: string
  CantTotEntregada: string
  NoLote: string
  FecEntrega: string
  FecRepEntrega: string
  EstRepEntrega: number
  FecAnulacion: string | null
}

/**
 * Payload de PutFacturacion (Tx -1- SISPRO WSFACMIPRESNOPBS) armado en el
 * frontend cruzando direccionamiento + reporte de entrega + inputs del usuario.
 * El backend solo lo reenvía.
 */
export interface FacturacionInput {
  NoPrescripcion: string
  TipoTec: string
  ConTec: number
  TipoIDPaciente: string
  NoIDPaciente: string
  NoEntrega: number
  NoSubEntrega: number
  NoFactura: string
  NoIDEPS: string
  CodEPS: string
  CodSerTecAEntregado: string
  CantUnMinDis: string
  ValorUnitFacturado: string
  ValorTotFacturado: string
  CuotaModer: string
  Copago: string
}
