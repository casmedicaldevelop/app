// Escenarios observables — generación del Formato de Entrega (lib/formato.ts).
// (El frontend aún no tiene runner de tests; estos escenarios son el holdout que define "hecho".)
//
// deliveryCode(filing, delivery) → RM-{idRadicado}-{P|C}{n°entrega}
//   FM-1  PARCIAL n°1 del radicado 4            → "RM-4-P1"
//   FM-2  COMPLETA n°2 del radicado 4           → "RM-4-C2"
//
// buildFormatoFields({ company, filing, delivery }) — mapeo de datos reales:
//   FM-3  code         = "RM-4-P1"
//   FM-4  userName     = "LUIS JAVIER ALEMÁN MORA"  (compone los 4 nombres del paciente)
//   FM-5  userDoc      = "CC 6599806"               (documentType + document)
//   FM-6  cum          = inventoryCode del filing   ("EPS002429")
//   FM-7  description  = technologyCode + " - " + medicationName
//   FM-8  quantity     = delivery.quantityDelivered (60)  — entrega PARCIAL (faltante > 0)
//   FM-13 entrega FINAL (faltante = 0, la que completa el medicamento): quantity = filing.quantityToDeliver (total).
//         Ej: total 30 entregado 10+10+10 → formato de la 3ª entrega muestra Cant. 30, no 10.
//         Las parciales (FM-8) y la entrega única completa quedan igual.
//   FM-9  entregaNumber= solo el número de la entrega ("1" o "2")
//   FM-10 receivedDate = fecha de la entrega (dd/mm/aaaa) — se muestra una sola vez
//   FM-11 companyLine  = solo "NIT {nit} · Tel. {phone}" (sin nombre ni dirección)
//   FM-12 sin paciente → userName y userDoc = filing.userDocument (fallback, no rompe)
//
// Documento (openFormatoWindow): header con logo grande + título + código RM (sin la etiqueta "Código");
// bloque Entrega = # Entrega / Fecha / Prescripción (sin radicado); tabla con columna "Cant.";
// firma rotulada "Firma y cédula"; sello ENTREGADO en zona libre. Empresa tomada de la tabla Company.
export {}
