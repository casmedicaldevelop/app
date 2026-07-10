// Escenarios observables — Fecha de factura/ticket por lote (proceso de entrega del detalle).
// (El frontend no tiene runner; estos escenarios son el holdout que define "hecho".)
//
//   IB-1  Cada lote del proceso de entrega tiene las acciones Factura, Ticket y Ver detalle. La columna
//         "Fecha" del lote sigue mostrando la fecha REAL de la entrega (delivery_event.createdAt); no cambia.
//   IB-2  Al pulsar Factura o Ticket se abre PRIMERO un modal con un campo de fecha (no imprime de una).
//   IB-3  Precarga: si ese lote ya tiene fecha de factura guardada (invoice_date), el modal la trae; si aún
//         no existe, el campo arranca VACÍO.
//   IB-4  La fecha es obligatoria (no se puede confirmar vacío). Al confirmar se guarda vía
//         PATCH /filing-event/:id/batches/:batch/invoice-date y SOBRESCRIBE: queda la última ingresada.
//         [AMPLIADO por SF-*: en la FACTURA hay un botón "Sin fecha" que imprime sin fecha.
//          En el TICKET la fecha sigue siendo obligatoria sin excepción.]
//   IB-5  Tras guardar se imprime el documento con esa fecha: la FACTURA muestra esa fecha en "Fecha"
//         (ya no la fecha de hoy) y el TICKET muestra esa misma fecha (línea nueva de fecha).
//   IB-6  Fecha real vs fecha de factura son DOS valores distintos guardados en la MISMA tabla
//         (delivery_event: createdAt = real; invoice_date = la del documento). La fecha real no se altera.
//   IB-7  La fecha de factura es UNA por lote: se guarda igual en todas las filas de ese deliveryBatch de la
//         radicación, y la comparten su factura y su ticket.
//   IB-8  Cerrar el modal sin confirmar no guarda ni imprime.
//         [AMPLIADO por SF-1: se cierra dando clic afuera; ya no hay botón Cancelar.]
//   IB-9  Backend: nueva columna nullable invoice_date en delivery_event; listFilingDeliveries la devuelve
//         (invoiceDate); el endpoint la setea para todas las filas del lote de esa radicación.
//  IB-10  La tabla del proceso de entrega muestra DOS columnas de fecha (reemplaza la antigua "Fecha"):
//         "Fecha de registro" = createdAt (cuándo se registró la entrega) y "Fecha de entrega" = invoice_date
//         (la que sale en factura/ticket; muestra "—" mientras no se haya fijado).
//  IB-11  El documento del proceso (buildFacturaProcesoHtml) se titula "FORMATO DE ENTREGA DE MEDICAMENTOS
//         E INSUMOS MEDICOS" (ya no "FACTURA DE ENTREGA"), y el código del encabezado superior derecho es
//         fijo "CSM FT-21" para TODOS los lotes (ya no el código del lote E-n-n). El título largo cae bien
//         dentro de la hoja carta (no desborda). La fecha del documento sigue siendo la del modal.
//
// ── Opción "Sin fecha" (solo la FACTURA) ──────────────────────────────────────────────────────
//   SF-1  Clic en Factura → el modal muestra el input de fecha y dos botones: "Sin fecha" pegado
//         a la izquierda y "Continuar" pegado a la derecha. NO hay botón Cancelar: el modal se
//         cierra dando clic afuera (backdrop). Ningún rótulo de botón parte en dos renglones.
//   SF-2  "Sin fecha" está siempre habilitado (no depende de que el input tenga valor).
//         "Continuar" sigue deshabilitado mientras el input esté vacío, como hoy.
//   SF-3  Pulsar "Sin fecha" → NO se dispara PATCH /filing-event/:id/batches/:batch/invoice-date.
//         Se abre la pestaña con la factura.
//   SF-4  Esa factura imprime, en la fila "Fecha", una casilla gris muy claro con la máscara
//         "DD / MM / AAAA" en vez de un valor, para llenarla a mano.
//   SF-6  Pulsar "Continuar" con fecha: comportamiento idéntico a IB-4/IB-5 — se guarda la fecha, se
//         invalida ['filing-event', id, 'all-deliveries'] y la factura imprime la fecha real.
//   SF-7  El modal del TICKET no muestra el botón "Sin fecha" (allowNoDate = false).
//   SF-8  Imprimir sin fecha no altera la columna "Fecha de entrega" del lote (IB-10): si ya tenía
//         invoice_date guardada la sigue mostrando; si no tenía, sigue en "—".
//   SF-I1 La ventana se abre con window.open síncrono dentro del clic (no la bloquea el navegador),
//         tanto con fecha como sin fecha.
//   SF-I2 Si falla setBatchInvoiceDate (camino con fecha), la ventana se cierra y sale un toast.
export {}
