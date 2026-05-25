export {}

// SCENARIO 1: Lista de personal carga correctamente
// GIVEN el usuario navega a /dashboard/staff
// WHEN GET /staff responde con datos
// THEN se muestra la tabla con el personal registrado

// SCENARIO 2: Búsqueda filtra el personal
// GIVEN el usuario escribe en el campo de búsqueda
// WHEN el debounce se dispara
// THEN GET /staff?search=... actualiza la tabla

// SCENARIO 3: Filtros de estado y rol funcionan
// GIVEN el usuario selecciona un estado o rol
// WHEN el filtro cambia
// THEN la tabla muestra solo el personal que coincide

// SCENARIO 4: Estado vacío muestra mensaje apropiado
// GIVEN no hay personal registrado
// WHEN GET /staff responde con array vacío
// THEN se muestra el mensaje "No hay personal registrado" con CTA

// SCENARIO 5: Error de red muestra estado de error con reintentar
// GIVEN la petición GET /staff falla
// WHEN el componente detecta el error
// THEN se muestra el botón "Reintentar"
