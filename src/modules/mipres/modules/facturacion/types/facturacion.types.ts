/**
 * Schema real del item Factura devuelto por
 * GET /api/FacturacionXPrescripcion del WSFACMIPRESNOPBS, verificado contra
 * un response real de SISPRO.
 *
 * Nota: los valores monetarios (ValorUnitFacturado, ValorTotFacturado,
 * CuotaModer, Copago) y la cantidad (CantUnMinDis) vienen como number en el
 * response, aunque el swagger del PUT los tipa como string.
 */
export interface FacturacionItem {
  ID: number
  IDFacturacion: number
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
  CantUnMinDis: number
  ValorUnitFacturado: number
  ValorTotFacturado: number
  CuotaModer: number
  Copago: number
  FecFacturacion: string
  EstFacturacion: number
  FecAnulacion: string | null
  CodigosFacturacion: unknown
}
