// Escenarios observables — modal "Nueva entrega".
// NE-1  Al precargar un direccionamiento, la Fecha de entrega queda en min(hoy, FecMaxEnt):
//       hoy si hoy <= FecMaxEnt; FecMaxEnt si hoy ya la superó.
// NE-2  Ya no existe el input "Cant. entregada"; al registrar, cantTotEntregada = CantTotAEntregar del direccionamiento.
// NE-3  La fecha sigue sin poder superar FecMaxEnt (max del input + validación al enviar).
export {}
