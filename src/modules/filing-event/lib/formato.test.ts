// Escenarios observables — Formato de entrega del lote (lib/formato.ts).
// (El frontend aún no tiene runner de tests; estos escenarios son el holdout que define "hecho".)
//
// renderFacturaProceso({ company, filing, batchCode, lines, invoiceDate })
//
// invoiceDate CON valor (comportamiento vigente, no debe cambiar):
//   SF-6  invoiceDate "2026-07-09" → la fila "Fecha" del bloque Entrega imprime "09/07/2026".
//   SF-6b El documento NO contiene la clase .date-blank.
//
// invoiceDate = null (opción "Sin fecha" del modal):
//   SF-4  la fila "Fecha" imprime <span class="date-blank">DD / MM / AAAA</span> en vez de un valor.
//   SF-4b el resto del documento es idéntico: mismo header CSM FT-21, mismo bloque Usuario,
//         misma tabla de líneas, misma declaración, mismo sello ENTREGADO, mismo pie.
//   SF-5  .date-blank sale impreso: fondo #F7F9FC y borde visibles en vista previa de impresión
//         (el body ya declara print-color-adjust:exact). La hoja sigue midiendo 279 mm de alto
//         con hasta 5 líneas — la casilla no altera el alto del documento.
//
// Contrato de tipos:
//   SF-T1 FacturaProcesoData.invoiceDate es `string | null`.
//   SF-T2 ticket.ts NO cambia: PendingTicketData.invoiceDate sigue siendo `string` (el ticket de
//         pendiente siempre exige fecha).
export {}
