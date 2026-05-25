export {}

// SCENARIO 1: Lista de proveedores carga correctamente
// GIVEN el usuario navega a /dashboard/providers
// WHEN la petición GET /providers responde con 5 proveedores
// THEN se muestran 5 tarjetas con nombre, dirección, teléfono y fecha de actualización

// SCENARIO 2: Tarjeta sin datos opcionales muestra placeholder
// GIVEN un proveedor sin dirección ni teléfono
// WHEN se renderiza su tarjeta
// THEN se muestra "Sin dirección" / "Sin teléfono" en texto muted

// SCENARIO 3: Click en tarjeta navega al detalle
// GIVEN el usuario ve la lista de proveedores
// WHEN hace click en la tarjeta de un proveedor
// THEN el router navega a /dashboard/providers/:id

// SCENARIO 4: Estado de carga muestra skeleton
// GIVEN la petición está en curso
// WHEN la pantalla está montada
// THEN se muestran 5 skeleton cards mientras carga

// SCENARIO 5: Error de red muestra mensaje de error
// GIVEN la petición falla con error de red
// WHEN la pantalla está montada
// THEN se muestra un mensaje de error con opción de reintentar
