// Escenarios observables — botón "Anular" en el panel de programaciones.
// AN-1  programación vigente cuyo IDProgramacion ∈ deliveredScheduleIds → Anular disabled, tooltip "ya hay entregas".
// AN-2  programación vigente cuyo IDProgramacion ∉ deliveredScheduleIds → Anular habilitado.
// AN-3  mientras deliveriesReady=false (cargando) → Anular disabled por defecto.
export {}
