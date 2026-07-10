// Escenarios observables — botón "Formato" en la lista de entregas del detalle de radicación.
//
// DH-1  Dado un radicado con una entrega registrada,
//       cuando el usuario hace clic en el ícono "Formato" de esa fila,
//       entonces se abre una pestaña nueva con el Formato de Entrega (tamaño carta)
//       generado por openFormatoWindow({ company, filing, delivery }).
//
// DH-2  Dado el documento generado,
//       entonces muestra el código RM correcto de la entrega (RM-{idRadicado}-{P|C}{n°}),
//       el nombre del usuario, el medicamento y la cantidad entregada de esa entrega.
//
// DH-3  Dado que el botón "Formato" antes estaba deshabilitado,
//       entonces ahora está habilitado (no tiene atributo disabled ni cursor-not-allowed).
//
// La lógica de generación (código RM y mapeo de datos) se verifica en lib/formato.test.ts.
export {}
