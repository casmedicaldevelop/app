// Escenarios observables — código de estantería en el ticket (lib/ticket.ts + backend).
// (El frontend aún no tiene runner; estos escenarios son el holdout que define "hecho".)
//
// Backend (FilingMipresService.assignShelfCode):
//   TK-1  Radicado sin shelfCode + primer ticket → asigna el siguiente del contador global
//         y lo guarda. Primer código del sistema = "A1".
//   TK-2  Reimpresión del mismo radicado → devuelve el MISMO shelfCode; el contador NO avanza.
//   TK-3  Dos radicados distintos asignados en orden → "A1" y "A2" (densos, sin saltos).
//   TK-4  Fórmula shelfCodeFromValue (orden odómetro, número primero):
//         1→A1, 100→A100, 101→B1, 2600→Z100, 2601→A1 (vuelve a empezar).
//
// Ticket (renderTicket / openTicketWindow):
//   TK-5  El ticket muestra el código de estantería centrado, grande y en negrita,
//         NO en la parte de arriba (va bajo TOTAL/ENTREGADO/FALTANTE, antes del código de barras).
//   TK-6  Al hacer clic en Ticket, la pestaña se abre de inmediato (gesto del usuario) y el
//         código se pide al backend (POST /filing-mipres/:id/shelf-code) antes de dibujar.
export {}
