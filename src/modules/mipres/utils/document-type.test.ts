// Escenarios observables — catálogo oficial de tipos de documento (document-type.ts).
//
// DT-1 Dado el valor 'PT' de SISPRO (caso real: prescripción 20260228169000532987,
//      documento 6599806), cuando se normaliza, entonces normalizeDocumentType('PT') === 'PT'
//      — nunca se reemplaza silenciosamente por 'CC'.
//
// DT-2 Dado cualquier código del catálogo oficial (mayúscula o minúscula),
//      cuando se normaliza, entonces retorna ese mismo código.
//
// DT-3 Dado un valor fuera del catálogo ('XX', '', null, undefined),
//      cuando se normaliza, entonces retorna null (sin fabricar tipos) y el formulario
//      bloquea el guardado en vez de persistir un tipo falso.
//
// DT-4 DOCUMENT_TYPES contiene exactamente los 14 códigos oficiales (catálogo del usuario,
//      2026-06-12): CC, CD, CE, CN, DE, MS, NV, PA, PE, PT, RC, SC, SI, TI — y
//      DOCUMENT_TYPE_LABELS tiene el label oficial de cada uno.
export {}
