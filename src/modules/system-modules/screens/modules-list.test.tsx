/**
 * Scenarios: ModulesListPage
 *
 * SM-1 — Stats bar visible
 *   Given: existen 5 módulos (3 activos, 2 inactivos)
 *   When: admin carga /dashboard/modulos
 *   Then: muestra 3 KPI cards: "5 Total", "3 Activos", "2 Inactivos"
 *
 * SM-2 — Filtro de tabs
 *   Given: stats bar visible con tabs "Todos | Activos | Inactivos"
 *   When: hace click en "Activos"
 *   Then: solo se muestran módulos con isActive=true; tab "Activos" tiene estado activo (aria-selected)
 *
 * SM-3 — Estado vacío global
 *   Given: no existen módulos en el sistema
 *   When: admin carga /dashboard/modulos
 *   Then: muestra empty state con icono, título "Sin módulos" y botón "Crear primer módulo"
 *
 * SM-4 — Estado vacío filtrado
 *   Given: existen módulos pero ninguno está inactivo
 *   When: admin selecciona tab "Inactivos"
 *   Then: muestra empty state contextual "No hay módulos inactivos" sin botón de creación
 *
 * SM-5 — Loading skeleton
 *   Given: la query está en estado loading
 *   When: admin carga /dashboard/modulos
 *   Then: muestra 6 skeleton cards con animación pulse; no muestra stats bar ni tabs
 *
 * SM-6 — Error state
 *   Given: la query falla con error de red
 *   When: admin carga /dashboard/modulos
 *   Then: muestra mensaje de error con botón "Reintentar"
 *
 * SM-7 — Navegar a crear módulo
 *   Given: admin en /dashboard/modulos
 *   When: hace click en "Nuevo módulo"
 *   Then: navega a /dashboard/modulos/nuevo
 */

export {}
