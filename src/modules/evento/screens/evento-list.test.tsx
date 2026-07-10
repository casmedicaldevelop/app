// Escenarios observables — número de contrato en el módulo Evento.
// (El frontend no tiene runner; estos escenarios son el holdout que define "hecho".)
//
// Base de datos (migración 20260709120000_add_event_contract_number):
//   NC-1  event_contract.contract_number es TEXT, NOT NULL y con índice UNIQUE.
//   NC-2  Las filas que ya existían quedan con el marcador determinista SIN-NUMERO-<id>.
//         La migración corre sobre tablas con datos sin romperlas (nullable → backfill →
//         NOT NULL → índice único).
//   NC-3  Insertar un contract_number duplicado falla con violación de unique constraint.
//   NC-4  Insertar contract_number NULL falla con violación de not-null.
//
// Formulario (components/event-contract-form-drawer.tsx):
//   NC-5  "Nuevo contrato" muestra el campo "Número de contrato" como PRIMER campo,
//         antes de las fechas, marcado obligatorio con asterisco.
//   NC-6  Enviar el formulario con el número vacío o solo espacios muestra "Requerido"
//         y no llama al endpoint.
//   NC-7  El número se envía recortado (sin espacios al inicio ni al final).
//
// Backend (event-contract.service.ts → create):
//   NC-8  Crear un contrato con un número ya usado devuelve 400 con el mensaje
//         "Ya existe un contrato con el número X." — no un 500 por violación de constraint.
//   NC-9  El DTO rechaza contractNumber ausente, vacío o de más de 50 caracteres.
//
// Tabla (screens/evento-list.tsx):
//  NC-10  La columna "Número" es la PRIMERA de la tabla, antes de "Inicio".
//         Orden final: Número · Inicio · Final · Total · Contributivo · Subsidiado · Estado · (acciones).
//
// Lo que NO cambia:
//  NC-11  La pantalla de detalle no se toca (el usuario no la pidió).
//  NC-12  La regla de un solo contrato EN CURSO, el cálculo de cupo, finalize y el toggle
//         abrir/cerrar siguen exactamente igual.
export {}
