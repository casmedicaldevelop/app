// Escenarios observables — Gestión de la tabla tvmed_evento.
// (El frontend no tiene runner; estos escenarios son el holdout que define "hecho".)
//
//   EV-1  /dashboard/tv-data/tvmed_evento muestra la lista de tvmed_evento: título "tvmed_evento",
//         botón "← Volver" (al hub), conteo de registros.
//   EV-2  La tabla muestra CUM, Nombre, Concentración, Presentación, Forma farmacéutica (descripción),
//         U. medida (descripción), U. dispensación (descripción) y Valor (COP, formato $). Unidad y
//         forma se muestran por NOMBRE, no por código.
//   EV-3  "Nuevo" y "Editar" abren un drawer desde la derecha con los 10 campos. Unidad de medida,
//         unidad de dispensación y forma farmacéutica son desplegables poblados de los catálogos
//         (measurement_units / pharmaceutical_forms) que muestran la descripción y guardan el código.
//   EV-4  "Filtros" abre drawer derecho con búsqueda (CUM/nombre/diminutivo/concentración); badge si activo.
//   EV-5  "Carga masiva" reemplaza toda la tabla; plantilla = plantilla_tvmed_evento.xlsx; columnas de
//         unidad/forma por código. Eliminar = modal de confirmación.
//   EV-6  cum NO es único (dos registros pueden compartirlo). value = entero COP. Todos los campos obligatorios.
//   EV-7  Backend: tabla tvmed_evento con FKs a measurement_units (medida y dispensación) y a
//         pharmaceutical_forms (forma). Catálogos sembrados; su CRUD se hará luego en módulo aparte.
export {}
