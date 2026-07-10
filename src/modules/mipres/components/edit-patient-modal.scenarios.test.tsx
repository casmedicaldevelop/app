/**
 * Observable scenarios for description-as-optional-textarea change.
 * Applies to BOTH RegisterPatientForm and EditPatientModal (same UX rule).
 *
 * GIVEN the MIPRES register/edit user form is open
 * WHEN the user submits with ALL fields filled EXCEPT description
 * THEN submission proceeds without validation error AND
 *      the description field is rendered as a <textarea> (not <input>)
 *
 * GIVEN the form is open
 * WHEN the user submits with description left blank
 * THEN backend isUserComplete() must NOT block isComplete on description AND
 *      the workspace tools are enabled after save
 *
 * GIVEN the form is open
 * WHEN the user inspects the "Descripción" field label
 * THEN it shows NO red asterisk (no required indicator)
 */

// Pendientes (sin runner de tests instalado — convención del repo):
// - renders description as textarea
// - accepts submission with description blank
// - shows no required asterisk on description label
// - backend isUserComplete returns true even when description is empty
export {}
