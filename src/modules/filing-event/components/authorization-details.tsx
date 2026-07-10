import { useEffect, useState } from 'react'
import { diagnosesLookup } from '../services/diagnoses.service'

interface Afiliado {
  tipo_documento?: string | null
  numero_documento?: string | null
  primer_apellido?: string | null
  segundo_apellido?: string | null
  primer_nombre?: string | null
  segundo_nombre?: string | null
  fecha_nacimiento?: string | null
  categoria?: string | null
  tipo_afiliado?: string | null
  direccion_residencia?: string | null
  telefono?: string | null
  celular?: string | null
  departamento?: string | null
  municipio?: string | null
  correo?: string | null
}
interface Servicio {
  codigo?: string | null
  cantidad?: number | null
  descripcion?: string | null
  observacion?: string | null
}
export interface OcrData {
  numero_autorizacion?: string | null
  codigo_remitente?: string | null
  nombre_remitente?: string | null
  fecha_orden_medica?: string | null
  fecha_solicitud_ips?: string | null
  fecha_autorizacion?: string | null
  diagnostico_principal?: string | null
  afiliado?: Afiliado
  servicios?: Servicio[]
}

const val = (v: unknown) => {
  if (v === null || v === undefined || v === '') return '—'
  return String(v)
}
const fmtDate = (iso?: string | null) => {
  if (!iso) return '—'
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  return m ? `${m[1]}/${m[2]}/${m[3]}` : iso
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground break-words">{value}</p>
    </div>
  )
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 border-b border-border pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  )
}

/** Muestra la información extraída de la autorización (solo lectura). */
export default function AuthorizationDetails({ data }: { data: OcrData }) {
  const a = data.afiliado ?? {}
  const servicios = data.servicios ?? []
  const [diagnosisDetail, setDiagnosisDetail] = useState<string | null>(null)

  // Resuelve la descripción del diagnóstico (tabla diagnoses) por el código del OCR.
  useEffect(() => {
    const code = (data.diagnostico_principal ?? '').trim()
    if (!code) { setDiagnosisDetail(null); return }
    let active = true
    diagnosesLookup.search(code)
      .then((rs) => {
        if (!active) return
        const exact = rs.find((r) => r.code.toUpperCase() === code.toUpperCase())
        setDiagnosisDetail(exact ? exact.description : null)
      })
      .catch(() => { if (active) setDiagnosisDetail(null) })
    return () => { active = false }
  }, [data.diagnostico_principal])

  return (
    <div className="space-y-4">
      <Section title="General">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 lg:grid-cols-4">
          <Field label="N° de autorización" value={val(data.numero_autorizacion)} />
          <Field label="Fecha orden médica" value={fmtDate(data.fecha_orden_medica)} />
          <Field label="Fecha solicitud IPS" value={fmtDate(data.fecha_solicitud_ips)} />
          <Field label="Fecha autorización" value={fmtDate(data.fecha_autorizacion)} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 lg:grid-cols-4">
          <Field label="Código remitente" value={val(data.codigo_remitente)} />
          <Field label="Nombre del remitente" value={val(data.nombre_remitente)} />
          <Field label="Diagnóstico principal" value={val(data.diagnostico_principal)} />
          <Field label="Detalle del diagnóstico" value={diagnosisDetail ?? '—'} />
        </div>
      </Section>

      <Section title="Usuario">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 lg:grid-cols-4">
          <Field label="Tipo de documento" value={val(a.tipo_documento)} />
          <Field label="Número de documento" value={val(a.numero_documento)} />
          <Field label="Primer nombre" value={val(a.primer_nombre)} />
          <Field label="Segundo nombre" value={val(a.segundo_nombre)} />
          <Field label="Primer apellido" value={val(a.primer_apellido)} />
          <Field label="Segundo apellido" value={val(a.segundo_apellido)} />
          <Field label="Fecha de nacimiento" value={fmtDate(a.fecha_nacimiento)} />
          <Field label="Departamento" value={val(a.departamento)} />
          <Field label="Municipio" value={val(a.municipio)} />
          <Field label="Dirección de residencia" value={val(a.direccion_residencia)} />
          <Field label="Celular" value={val(a.celular)} />
          <Field label="Correo electrónico" value={val(a.correo)} />
        </div>
      </Section>

      <Section title="Servicios">
        {servicios.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin servicios.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Código</th>
                  <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Cantidad</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Descripción</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Observación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {servicios.map((s, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-xs font-mono text-foreground whitespace-nowrap">{val(s.codigo)}</td>
                    <td className="px-3 py-2 text-xs text-foreground text-right tabular-nums">{val(s.cantidad)}</td>
                    <td className="px-3 py-2 text-xs text-foreground">{val(s.descripcion)}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{val(s.observacion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  )
}
