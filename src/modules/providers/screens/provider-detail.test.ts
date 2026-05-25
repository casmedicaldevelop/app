export {}

// SCENARIO 1: Detalle de proveedor carga metadatos y productos
// GIVEN el usuario navega a /dashboard/providers/1
// WHEN las peticiones GET /providers/1 y GET /providers/1/products responden correctamente
// THEN se muestran el formulario de metadatos y la tabla de productos paginada

// SCENARIO 2: Editar metadatos guarda los cambios
// GIVEN el usuario modifica dirección o teléfono y hace click en "Guardar"
// WHEN la mutación PATCH /providers/:id se resuelve
// THEN se muestra un toast de éxito y el formulario refleja los nuevos valores

// SCENARIO 3: Búsqueda de productos filtra la tabla
// GIVEN el usuario escribe en el campo de búsqueda
// WHEN el debounce se dispara
// THEN la petición GET /providers/:id/products?search=... actualiza la tabla

// SCENARIO 4: Paginación avanza y retrocede páginas
// GIVEN hay más de 20 productos
// WHEN el usuario hace click en "Siguiente"
// THEN la tabla muestra la página 2 de productos

// SCENARIO 5: Modal de carga masiva abre, descarga plantilla y sube archivo
// GIVEN el usuario hace click en "Carga masiva"
// WHEN el modal abre
// THEN puede descargar la plantilla .xlsx y subir un archivo Excel

// SCENARIO 6: Modo "Subir" requiere confirmación antes de reemplazar todos los datos
// GIVEN el usuario selecciona modo "Subir" y confirma
// WHEN el archivo se procesa correctamente
// THEN un toast muestra el conteo de productos importados
