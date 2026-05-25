export {}

// SCENARIO 1: Detalle de personal carga metadatos y módulos
// GIVEN el usuario navega a /dashboard/staff/:id
// WHEN GET /staff/:id responde correctamente
// THEN se muestra el formulario de edición y el asignador de módulos

// SCENARIO 2: Editar datos del personal guarda cambios
// GIVEN el usuario modifica nombre o email y hace click en "Guardar cambios"
// WHEN la mutación PATCH /staff/:id se resuelve
// THEN se muestra un toast de éxito y el formulario refleja los nuevos valores

// SCENARIO 3: Asignación de módulos funciona por toggle
// GIVEN el personal tiene módulos asignados
// WHEN el usuario hace click en un módulo para activar/desactivar
// THEN POST /staff/:id/modules actualiza los módulos inmediatamente

// SCENARIO 4: Personal no encontrado muestra estado de error
// GIVEN el ID en la URL no corresponde a ningún personal
// WHEN GET /staff/:id responde con 404
// THEN se muestra el mensaje "Personal no encontrado" con link de regreso
