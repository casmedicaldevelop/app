import type { DocumentType } from '../../users/types/service-user.types'

// Official SISPRO/MIPRES document type catalog (14 codes, provided 2026-06-12).
export const DOCUMENT_TYPES: readonly DocumentType[] = [
  'CC', // Cédula de Ciudadanía
  'CD', // Carnet Diplomático
  'CE', // Cédula de Extranjería
  'CN', // Certificado de nacido vivo
  'DE', // Documento extranjero
  'MS', // Menor sin Identificación
  'NV', // Certificado de nacido vivo
  'PA', // Pasaporte
  'PE', // Permiso Especial de Permanencia
  'PT', // Permiso por Protección Temporal
  'RC', // Registro Civil
  'SC', // Salvoconducto
  'SI', // Sin Identificación
  'TI', // Tarjeta de Identidad
]

// Official labels (same catalog, provided 2026-06-12). CN and NV share the
// same label in the source catalog.
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  CC: 'Cedula de Ciudadanía',
  CD: 'Carnet Diplomático',
  CE: 'Cedula de Extranjería',
  CN: 'Certificado de nacido vivo',
  DE: 'Documento extranjero',
  MS: 'Menor sin Identificación',
  NV: 'Certificado de nacido vivo',
  PA: 'Pasaporte',
  PE: 'Permiso Especial de Permanencia',
  PT: 'Permiso por Protección Temporal',
  RC: 'Registro Civil',
  SC: 'Salvoconducto',
  SI: 'Sin Identificación',
  TI: 'Tarjeta de Identidad',
}

// Returns null for values outside the catalog: the form must surface the raw
// value and block submit — never persist a fabricated type.
export function normalizeDocumentType(
  raw: string | null | undefined,
): DocumentType | null {
  if (!raw) return null
  const upper = raw.toUpperCase()
  return (DOCUMENT_TYPES as readonly string[]).includes(upper)
    ? (upper as DocumentType)
    : null
}
