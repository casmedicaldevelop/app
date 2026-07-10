import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { useEventContract } from '../hooks/useEventContract'

const EN_CURSO = 'EN CURSO'
const cop = (n: number) => '$ ' + new Intl.NumberFormat('es-CO').format(n)
const fmtDate = (iso: string | null) => {
  if (!iso) return '—'
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium tabular-nums text-foreground">{value}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{children}</div>
    </div>
  )
}

export default function EventoDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: c, isLoading, isError } = useEventContract(Number(id))

  return (
    <>
      <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <button type="button" onClick={() => navigate('/dashboard/evento')} aria-label="Volver" title="Volver"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-input text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-base font-semibold text-foreground">Detalle del contrato</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Cargando…</div>
        ) : isError || !c ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <p className="text-sm text-muted-foreground">No se pudo cargar el contrato</p>
          </div>
        ) : (
          <div className="space-y-6 px-6 py-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Estado</span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                c.status === EN_CURSO ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>{c.status}</span>
            </div>

            <Section title="Vigencia">
              <Field label="Fecha de inicio" value={fmtDate(c.startDate)} />
              <Field label="Fecha final" value={fmtDate(c.endDate)} />
              <Field label="Fecha de cierre" value={fmtDate(c.closeDate)} />
            </Section>

            <Section title="Valores del contrato (COP)">
              <Field label="Total" value={cop(c.totalValue)} />
              <Field label="Contributivo" value={cop(c.contributoryValue)} />
              <Field label="Subsidiado" value={cop(c.subsidizedValue)} />
            </Section>

            <Section title="Consumido (COP)">
              <Field label="Total" value={cop(c.consumedTotal)} />
              <Field label="Contributivo" value={cop(c.consumedContributory)} />
              <Field label="Subsidiado" value={cop(c.consumedSubsidized)} />
            </Section>
          </div>
        )}
      </div>
    </>
  )
}
