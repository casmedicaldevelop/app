export {}

// SCENARIO 1: Formulario de creación valida campos requeridos
// GIVEN el usuario intenta crear sin llenar campos obligatorios
// WHEN hace click en "Crear personal"
// THEN se muestran los errores de validación en cada campo

// SCENARIO 2: Creación exitosa muestra contraseña temporal
// GIVEN el usuario llena todos los campos correctamente
// WHEN POST /staff responde con éxito
// THEN se muestra la vista de contraseña temporal con opción de copiar

// SCENARIO 3: Error de duplicado muestra mensaje de error
// GIVEN el email o username ya existe en el sistema
// WHEN POST /staff responde con 409 Conflict
// THEN se muestra el error específico debajo del formulario

// SCENARIO 4: Cancelar regresa a la lista de personal
// GIVEN el usuario está en el formulario de creación
// WHEN hace click en "Cancelar"
// THEN navega a /dashboard/staff sin guardar cambios
