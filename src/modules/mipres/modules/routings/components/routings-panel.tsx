import { useState } from 'react'
import { ChevronDown, CircleCheck, CircleX, Code2, Copy, HelpCircle, Link2, Search } from 'lucide-react'
import { toast } from 'sonner'
import type { RoutingItem } from '../types/routings.types'
import { routingStatus, type RoutingStatus } from '../utils/routings.utils'
import TvMedProductsModal from '../../../components/tv-med-products-modal'
import TvMedPickerModal from '../../../components/tv-med-picker-modal'
import RequestDebugModal from '../../../components/request-debug-modal'
import { SESSION_DEBUG_KEYS } from '../../../services/session.service'
import { useRequestMeta } from '../../../../../lib/request-log'

interface RoutingsPanelProps {
  items: RoutingItem[]
  prescriptionNumber: string
  onBind: (item: RoutingItem, codSerTecOverride?: string) => void
  bindingIds: Set<number>
  companyConfigured: boolean
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return iso
  return `${m[3]}/${m[2]}/${m[1]}`
}

export default function RoutingsPanel({
  items,
  onBind,
  bindingIds,
  companyConfigured,
}: RoutingsPanelProps) {
  const inFlight = bindingIds.size
  const [showDebug, setShowDebug] = useState(false)
  const loadWorkspaceMeta = useRequestMeta(SESSION_DEBUG_KEYS.loadWorkspace)

  return (
    <div className="flex flex-col gap-2.5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Direccionamientos</h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Direccionamientos SISPRO de esta prescripción.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowDebug(true)}
          aria-label="Ver request/response de la petición que trae los direccionamientos"
          title="Ver request/response"
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-600 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          <Code2 className="h-3.5 w-3.5" />
          Ver request
        </button>
      </header>

      {inFlight > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 shadow-sm">
          <span className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <div className="flex-1">
            <p className="text-sm font-bold text-primary">
              Registrando {inFlight === 1 ? 'programación' : `${inFlight} programaciones`} en SISPRO…
            </p>
            <p className="text-xs text-slate-600">
              SISPRO suele tardar varios segundos. Cuando termine, la nueva fila aparece en la pestaña <strong>Programaciones</strong>.
            </p>
          </div>
        </div>
      )}
      {items.map((item) => (
        <RoutingRow
          key={item.IDDireccionamiento}
          item={item}
          onBind={onBind}
          binding={bindingIds.has(item.ID)}
          companyConfigured={companyConfigured}
        />
      ))}

      {showDebug && (
        <RequestDebugModal
          title="Direccionamientos · GET /mipres/prescription/{n}/workspace"
          meta={loadWorkspaceMeta}
          onClose={() => setShowDebug(false)}
        />
      )}
    </div>
  )
}

interface RoutingRowProps {
  item: RoutingItem
  onBind: (item: RoutingItem, codSerTecOverride?: string) => void
  binding: boolean
  companyConfigured: boolean
}

function RoutingRow({
  item,
  onBind,
  binding,
  companyConfigured,
}: RoutingRowProps) {
  const [open, setOpen] = useState(false)
  const [showTvMed, setShowTvMed] = useState(false)
  const status = routingStatus(item)
  const active = status !== 'canceled'

  const dateLabel = status === 'canceled' ? 'Fecha de cancelación' : 'Fecha máxima de entrega'
  const dateValue = status === 'canceled' ? fmtDate(item.FecAnulacion) : fmtDate(item.FecMaxEnt)

  return (
    <article
      className={[
        'overflow-hidden rounded-lg border bg-white shadow-sm transition-all',
        active ? 'border-slate-200' : 'border-slate-200 opacity-75',
      ].join(' ')}
    >
      {/* flex-wrap: on narrow screens columns wrap and chevron stays visible
          at the end of the last line via ml-auto. */}
      <header className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <div className="w-28 shrink-0">
          <StatusPill status={status} />
        </div>

        <div className="w-36 shrink-0">
          <Block label="ID">
            <CopyableId value={item.ID} />
          </Block>
        </div>

        <div className="w-44 shrink-0">
          <Block label="Código del producto">
            <span className="flex items-center gap-1.5">
              <span className="font-mono text-base font-bold text-slate-900">
                {item.CodSerTecAEntregar}
              </span>
              <button
                type="button"
                onClick={() => setShowTvMed(true)}
                aria-label={`Ver productos TvMed para código ${item.CodSerTecAEntregar}`}
                title={`Ver productos TvMed para código ${item.CodSerTecAEntregar}`}
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-primary/5 hover:text-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </span>
          </Block>
        </div>

        <div className="w-52 shrink-0">
          <Block label={dateLabel}>
            <span className="font-mono text-base font-bold text-slate-900">{dateValue}</span>
          </Block>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Colapsar detalle' : 'Ver detalle completo'}
          aria-expanded={open}
          title={open ? 'Colapsar' : 'Ver detalle completo'}
          className="ml-auto flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
        >
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </header>

      {open && (
        <ExpandedDetails
          item={item}
          active={status === 'active'}
          binding={binding}
          companyConfigured={companyConfigured}
          onBind={(codSerTec) => onBind(item, codSerTec)}
        />
      )}

      {showTvMed && (
        <TvMedProductsModal
          code={item.CodSerTecAEntregar}
          onClose={() => setShowTvMed(false)}
        />
      )}
    </article>
  )
}

function CopyableId({ value }: { value: number }) {
  const [copied, setCopied] = useState(false)
  const onClick = async () => {
    const text = String(value)
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for non-secure contexts (e.g. http://localhost without https).
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      toast.success('ID copiado al portapapeles')
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('No se pudo copiar el ID')
    }
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Copiar ID ${value} al portapapeles`}
      title="Clic para copiar"
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-1 -mx-1 font-mono text-base font-bold text-slate-900 transition-colors hover:bg-primary/5 hover:text-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
    >
      <span>{value}</span>
      <Copy className={`h-3.5 w-3.5 transition-colors ${copied ? 'text-emerald-600' : 'text-slate-400'}`} />
    </button>
  )
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <span className="leading-tight">{children}</span>
    </div>
  )
}

function StatusPill({ status }: { status: RoutingStatus }) {
  if (status === 'active') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <CircleCheck className="h-3.5 w-3.5" />
        Vigente
      </span>
    )
  }
  if (status === 'delivered') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
        <CircleCheck className="h-3.5 w-3.5" />
        Completado
      </span>
    )
  }
  if (status === 'canceled') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
        <CircleX className="h-3.5 w-3.5" />
        Anulado
      </span>
    )
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
      —
    </span>
  )
}

interface ExpandedDetailsProps {
  item: RoutingItem
  active: boolean
  binding: boolean
  companyConfigured: boolean
  onBind: (codSerTecOverride: string) => void
}

function ExpandedDetails({
  item,
  active,
  binding,
  companyConfigured,
  onBind,
}: ExpandedDetailsProps) {
  const [codSerTecInput, setCodSerTecInput] = useState(item.CodSerTecAEntregar)
  const [showPicker, setShowPicker] = useState(false)
  const fields: Array<{ label: string; value: string | number | null }> = [
    { label: 'IDDireccionamiento', value: item.IDDireccionamiento },
    { label: 'TipoTec', value: item.TipoTec },
    { label: 'ConTec', value: item.ConTec },
    { label: 'NoEntrega', value: item.NoEntrega },
    { label: 'NoSubEntrega', value: item.NoSubEntrega },
    { label: 'TipoIDProv', value: item.TipoIDProv },
    { label: 'NoIDProv', value: item.NoIDProv },
    { label: 'CodMunEnt', value: item.CodMunEnt },
    { label: 'CantTotAEntregar', value: item.CantTotAEntregar },
    { label: 'NoIDEPS', value: item.NoIDEPS },
    { label: 'CodEPS', value: item.CodEPS },
    { label: 'FecDireccionamiento', value: item.FecDireccionamiento },
    { label: 'EstDireccionamiento', value: item.EstDireccionamiento },
  ]

  return (
    <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3">
      <dl className="grid grid-cols-1 gap-x-8 gap-y-2.5 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((f) => (
          <div
            key={f.label}
            className="flex items-baseline justify-between gap-3 border-b border-slate-200/70 pb-1.5"
          >
            <dt className="font-mono text-slate-500">{f.label}</dt>
            <dd
              className="m-0 truncate font-mono font-semibold text-slate-900"
              title={String(f.value ?? '')}
            >
              {f.value ?? '—'}
            </dd>
          </div>
        ))}
      </dl>

      {active && (
        <div className="mt-3 flex items-end justify-end gap-2">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[11px] text-slate-500">Código a amarrar</span>
            <div className="flex items-stretch gap-1">
              <input
                type="text"
                value={codSerTecInput}
                onChange={(e) => setCodSerTecInput(e.target.value)}
                disabled={binding}
                maxLength={20}
                className="h-9 w-36 rounded-md border border-slate-300 bg-white px-3 font-mono text-sm font-semibold text-slate-900 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                disabled={binding}
                aria-label="Buscar producto en TvMed"
                title="Buscar producto en TvMed"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white text-slate-500 transition-colors duration-150 hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </label>
          <button
            type="button"
            onClick={() => onBind(codSerTecInput)}
            disabled={binding || !companyConfigured || !codSerTecInput.trim()}
            title={
              !companyConfigured
                ? 'Configurá NIT y código del prestador en la empresa antes de amarrar'
                : !codSerTecInput.trim()
                  ? 'El código no puede estar vacío'
                  : binding
                    ? 'Procesando...'
                    : 'Crear programación para este direccionamiento'
            }
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary/90 focus:outline-none focus:ring-[3px] focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {binding ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Procesando...
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" />
                Amarrar
              </>
            )}
          </button>
        </div>
      )}

      {showPicker && (
        <TvMedPickerModal
          onSelect={(picked) => {
            setCodSerTecInput(picked.code)
            setShowPicker(false)
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
