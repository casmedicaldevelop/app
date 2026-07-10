// Escenarios observables — tabla de radicaciones de evento (filing-event-table.tsx).
// (El frontend no tiene runner; estos escenarios son el holdout que define "hecho".)
//
// Columnas:
//   FT-1  La tabla NO muestra la columna "ID".
//   FT-2  La tabla NO muestra la columna "F. ingreso".
//   FT-3  Justo después de "Usuario" aparece la columna "Nombre" con el nombre completo del
//         usuario, concatenado como en todo el proyecto:
//         firstName + secondName + firstSurname + secondSurname, ignorando los vacíos.
//         (Misma regla que composeFullName en modules/users/utils/user-name.utils.ts,
//          y que lib/formato.ts y lib/ticket.ts.)
//   FT-4  Orden final de columnas: Autorización · Usuario · Nombre · Tipo de usuario ·
//         N° servicios · Valor total · Estado · (acción ver detalle).
//   FT-5  Si el usuario del radicado no existe en `users`, la celda "Nombre" muestra "—"
//         (no rompe, no imprime "undefined" ni cadena vacía).
//
// Lo que NO cambia:
//   FT-6  El botón de ver detalle sigue navegando a /dashboard/filing-event/:id — el id sigue
//         viniendo en los datos aunque ya no tenga columna propia.
//   FT-7  Paginación, conteo de radicaciones, píldora de estado y formato COP quedan igual.
//   FT-8  El colSpan de las filas "Cargando…" y "No hay radicaciones" coincide con el número
//         real de columnas (8).
//
// Backend (filing-event.service.ts → list):
//   FT-9  Cada fila de la lista trae `userName` ya compuesto. list() resuelve los nombres con una
//         sola consulta a `users` por página (findMany con `id in [...]`), no una por fila.
//  FT-10  Los conteos por estado y la paginación de list() no cambian.
//
// ── Filtros (mismo patrón que users y filing-mipres) ──────────────────────────────────────────
// Referencias verificadas: app/src/modules/users/screens/service-users-list.tsx (UsersFiltersDrawer)
// y app/src/modules/filing-mipres/components/filing-filters-drawer.tsx.
//
//   FF-1  Botón "Filtros" (icono SlidersHorizontal) en la barra de la tabla, junto al contador
//         de radicaciones. Con filtros activos muestra un badge con cuántos hay.
//   FF-2  Abre un drawer lateral derecho (createPortal, max-w-[420px]), titulado
//         "Filtrar radicaciones". Cierra por overlay, por la X y con Escape.
//   FF-3  Tres controles: "Documento de usuario" (input), "Nombre" (input) y "Régimen" (select
//         con Todos / CONTRIBUTIVO / SUBSIDIADO).
//   FF-4  Los cambios viven en un borrador local. NO hay debounce: nada se aplica hasta pulsar
//         "Aplicar filtros". "Limpiar" restablece y aplica los valores por defecto.
//   FF-5  Al aplicar: se cierra el drawer y la página vuelve a 1 (setPage(1)).
//   FF-6  Los params viajan en la queryKey de react-query, así que refetchea solo.
//         Params vacíos NO se mandan al endpoint.
//
// Semántica del filtro (idéntica a la del módulo de usuarios, verificada en
// api/src/modules/users/users.service.ts:116-122):
//   FF-7  "Documento de usuario" → `contains` + `mode: 'insensitive'` sobre filing_event.user_document.
//   FF-8  "Nombre" → el nombre NO vive en filing_event. Se resuelven primero los usuarios cuyo
//         firstName / secondName / firstSurname / secondSurname contenga el término (OR entre las
//         4 columnas, insensitive, SIN tokenizar), y se filtran las radicaciones por esos documentos.
//         Consecuencia heredada del patrón: "sanchez sanabria" NO encuentra nada, porque el texto
//         completo debe caber en UNA sola columna. Igual que hoy en el módulo de usuarios.
//   FF-9  "Régimen" → igualdad exacta contra filing_event.user_type (la foto del régimen al radicar),
//         que es la columna que la tabla muestra como "Tipo de usuario".
//  FF-10  Documento y Nombre se combinan con AND: si ambos están, deben cumplirse los dos.
//  FF-11  Si ningún usuario coincide con el nombre, la lista sale vacía (no devuelve todo).
//
// Paginación y export:
//  FF-12  El contador "N radicaciones" refleja el total FILTRADO (count con el mismo where).
//  FF-13  El paginador sigue apareciendo solo si totalPages > 1, como en users y filing-mipres.
//  FF-14  "Exportar Excel" exporta exactamente lo que está filtrado: list() y exportAll() comparten
//         el mismo constructor de `where` (filingWhere), como filing-mipres.service.ts.
export {}
