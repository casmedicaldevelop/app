// Escenarios observables — Radicación de evento (lista) · jerarquía de las tarjetas de billetera.
// (El frontend no tiene runner; estos escenarios son el holdout que define "hecho".)
//
//   FE-1  En /dashboard/filing-event, con un contrato EN CURSO activo, se renderizan 8 tarjetas:
//         fila 1 = Fecha de inicio · Fecha final · Valor total · Consumido total;
//         fila 2 = Valor contributivo · Consumido contributivo · Valor subsidiado · Consumido subsidiado.
//   FE-2  En las TRES tarjetas de billetera (Valor total, Valor contributivo, Valor subsidiado) la cifra
//         PROTAGONISTA (número grande, arriba) es el DISPONIBLE = valor − consumido del régimen respectivo:
//           - Valor total        → grande: totalValue − consumedTotal
//           - Valor contributivo  → grande: contributoryValue − consumedContributory
//           - Valor subsidiado    → grande: subsidizedValue − consumedSubsidized
//         El valor total queda como línea de apoyo pequeña con el prefijo "Total " (footer).
//         Ejemplo (contrato de la captura): "Valor total" muestra grande $156.437.100 y footer "Total $160.000.000".
//   FE-3  Las tarjetas de CONSUMIDO (total/contributivo/subsidiado) NO cambian: cifra = consumido,
//         barra de progreso + "X% del …". No se toca su contenido ni su umbral de color (≤50 verde, ≤80 naranja, resto rojo).
//   FE-4  No cambia nada más de la pantalla: gradientes/colores de las tarjetas, el label del encabezado de
//         cada tarjeta (VALOR TOTAL / VALOR CONTRIBUTIVO / VALOR SUBSIDIADO), el layout de la grilla, el
//         escáner, Exportar Excel, Nueva radicación ni la tabla de radicaciones.
//   FE-5  Sin contrato EN CURSO: no se renderizan tarjetas ni herramientas; solo el mensaje de "No hay un
//         contrato en curso".
export {}
