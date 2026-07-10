// Escenarios observables — creación de usuario (/dashboard/usuarios/nuevo).
//
// SUC-1 Dado /dashboard/usuarios/nuevo,
//       cuando se abre la pantalla,
//       entonces muestra TODOS los campos de la tabla users: tipo de documento (select con los
//       14 códigos del catálogo oficial), cédula, primer/segundo nombre, primer/segundo
//       apellido, género, nacimiento con toggle fecha exacta ↔ edad aproximada, teléfono,
//       correo, régimen, ciudad, barrio, dirección y descripción — con la línea visual .uv
//       del detalle (topbar con Volver + título + acciones, field-grid full-bleed).
//
// SUC-2 Dado el formulario en modo edad con valor 30,
//       cuando se guarda,
//       entonces el POST lleva birthDate = `${añoActual-30}-01-01` y birthDateApproximate = true.
//
// SUC-3 Dado el formulario con cualquier campo vacío excepto Descripción,
//       cuando se envía,
//       entonces muestra "Requerido" junto al campo y NO se hace el request.
//
// SUC-4 Dado el formulario completo con tipo de documento PT,
//       cuando se guarda,
//       entonces el payload incluye documentType: 'PT' y navega a /dashboard/usuarios.
//
// SUC-5 Dado /dashboard/usuarios/nuevo,
//       entonces la ruta es full-bleed en DashboardLayout (sin padding del main):
//       la pantalla ocupa el 100% del ancho como lista/detalle/MiPres/radicación.
//
// SUC-6 Dado cualquier texto de la pantalla,
//       entonces ningún font-size es menor a 14px (mínimo acordado).
//
// SUC-8 Dado /dashboard/usuarios/nuevo,
//       entonces la grilla de campos toca los bordes izquierdo y derecho del viewport
//       (cero canaleta lateral, sin card flotante), como la tabla de la lista de usuarios.
//
// SUC-7 Toggle de nacimiento (regla del usuario, 2026-06-12):
//       a) fecha 1985-06-15 → número ⇒ calcula 41.
//       b) número sin cambiar → fecha ⇒ muestra 1985-06-15 (la ingresada).
//       c) número cambiado a 30 → fecha ⇒ recalcula 1996-01-01.
//       d) viceversa: número 40 → fecha ⇒ 1986-01-01 → número ⇒ 40;
//          si la fecha cambió, el número se recalcula.
export {}
