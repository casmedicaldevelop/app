// Escenarios observables — Detalle de radicación de evento · edición inline de prescripción.
// (El frontend no tiene runner; estos escenarios son el holdout que define "hecho".)
//
//   ED-1  En /dashboard/filing-event/:id, cada medicamento/insumo es un desplegable (ServiceSection); al
//         abrirlo muestra sus 16 tarjetas de datos.
//   ED-2  Las 4 tarjetas de PRESCRIPCIÓN —Frecuencia por día, Duración del tratamiento, Cantidad prescrita
//         y Días de tratamiento— se editan con DOBLE CLIC: el valor se reemplaza por un input numérico
//         enfocado, con el contenido seleccionado.
//   ED-3  Guardado: Enter o clic afuera (blur) llama PATCH /filing-event/items/:itemId/prescription con solo
//         el campo cambiado; Escape cancela sin guardar. Tras guardar OK se refresca el detalle
//         (invalidate ['filing-event', filingId]) y la línea + el resumen quedan al día.
//   ED-4  Validación: entero >= 1. Vacío o inválido no guarda y avisa (toast); no dispara request. Si el
//         valor no cambió respecto al actual, no dispara request.
//   ED-5  Las otras 12 tarjetas (CUM, Tipo de servicio, Estado, Subestado, F. entrega, Oportunidad,
//         Concentración, Presentación, Vía de administración, Unidad de medida, Forma farmacéutica,
//         Unidad de dispensación) siguen de SOLO LECTURA: no tienen endpoint de guardado y varias son
//         calculadas por el sistema.
//   ED-6  No cambia nada más del detalle: bloques Usuario, Diagnóstico, Resumen y Entrega, ni la cabecera.
export {}
