// Escenarios observables — Hub del módulo TvData (tv-data-home.tsx). SOLO visual.
// (El frontend no tiene runner; estos escenarios son el holdout que define "hecho".)
//
//   TVH-1  NO hay título "Tablas" ni conteo "3 tablas" (era relleno inventado, se quitó).
//   TVH-2  Los títulos son los grupos: "MIPRES" y "EVENTOS", cada uno en una banda de header
//          blanca, 100% ancho, con borde abajo y el texto con padding interno.
//   TVH-3  Cada grupo lleva subtítulo: "Gestione los medicamentos para MIPRES" / "... para EVENTOS".
//   TVH-4  Las cards NO llevan subtítulo: solo el chip de ícono + el nombre de la tabla.
//   TVH-5  MIPRES → tvmed_mipres; EVENTOS → tvmed_evento + tvins_evento (lado a lado en sm+).
//          Cards estilo MoneyCard (gradiente), a ~1/3 del ancho (3 columnas), nunca al 100%.
//   TVH-6  El main es full-bleed (sin padding, no está en isFullBleedRoute porque ya NINGUNA ruta
//          lleva padding por defecto); el aire/bandas los pone este componente por dentro.
//   TVH-7  La card tvmed_mipres ES clickeable (cursor-pointer + hover) y navega a
//          /dashboard/tv-data/tvmed-mipres = gestión completa de la tabla (listar, registrar,
//          editar, carga masiva por Excel, eliminar). Las cards tvmed_evento y tvins_evento siguen
//          inertes (sus tablas aún no existen).
//   TVH-8  El flujo de gestión es coherente: crear/editar vuelven a la lista
//          (/dashboard/tv-data/tvmed-mipres), no al hub.
export {}
