// Escenarios observables — Gestión de tabla TvData (tv-data-list.tsx + tv-data-form-drawer.tsx).
// (El frontend no tiene runner; estos escenarios son el holdout que define "hecho".)
//
//   TVL-1  El título de la pantalla VARÍA según la card/tabla seleccionada: se lee de la URL
//          (/dashboard/tv-data/:table). Para la card tvmed_mipres → título "tvmed_mipres"
//          (ya no dice "TvData"). Subtítulo = conteo real de registros de esa tabla.
//   TVL-2  Crear y editar son un DRAWER que entra desde la DERECHA (no páginas aparte):
//          overlay + panel fijo a la derecha (replica el patrón de filing-filters-drawer),
//          cierra con Escape, click en overlay o botón X.
//   TVL-3  "Nuevo" abre el drawer en modo crear (form vacío). "Editar" de una fila abre el drawer
//          en modo editar (form precargado con ese registro). Al guardar con éxito, el drawer cierra
//          y la lista se refresca (invalidación de react-query en los hooks).
//   TVL-4  El resto de la gestión sigue: búsqueda, carga masiva por Excel (con plantilla),
//          eliminar (modal de confirmación) y paginación.
//   TVL-5  Ya NO existen las rutas /dashboard/tv-data/new ni /:id/edit (crear/editar son drawer).
export {}
