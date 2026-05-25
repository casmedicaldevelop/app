/**
 * Scenarios: ModuleCreatePage
 *
 * S1 — Navegación
 *   Given: admin en /dashboard/modulos
 *   When: hace click en "Nuevo módulo"
 *   Then: navega a /dashboard/modulos/nuevo (pantalla completa, no modal)
 *
 * S2 — Breadcrumb de regreso
 *   Given: admin en /dashboard/modulos/nuevo
 *   When: hace click en "Volver a Módulos"
 *   Then: navega a /dashboard/modulos
 *
 * S3 — Validación campos requeridos
 *   Given: formulario vacío
 *   When: hace click en "Crear módulo"
 *   Then: muestra errores en name, label e icon; no llama a la API
 *
 * S4 — Validación slug
 *   Given: campo name con valor "Mi Módulo" (tiene mayúsculas y espacio)
 *   When: hace click en "Crear módulo"
 *   Then: muestra "Solo minúsculas, números y guiones"
 *
 * S5 — Creación exitosa
 *   Given: formulario válido (name, label, icon seleccionado)
 *   When: hace click en "Crear módulo"
 *   Then: botón muestra spinner + "Creando...", al resolver navega a /dashboard/modulos
 *
 * S6 — Cancelar
 *   Given: formulario con datos parciales
 *   When: hace click en "Cancelar"
 *   Then: navega a /dashboard/modulos sin llamar a la API
 *
 * S7 — Preview de icono
 *   Given: icono "Package" seleccionado por defecto
 *   When: selecciona otro icono en IconPicker
 *   Then: el preview (cuadro azul + nombre del icono) se actualiza en tiempo real
 */

export {}
