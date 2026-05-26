import { Fragment, useState } from 'react'
import { ChevronDown, CircleCheck, CircleX, Code2, Plus, X } from 'lucide-react'
import type { EntregaItem } from '../types/deliveries.types'
import { entregaStatus, type EntregaStatus } from '../utils/deliveries.utils'
import { DELIVERIES_DEBUG_KEYS } from '../services/deliveries.service'
import { useRequestMeta } from '../../../../../lib/request-log'
import RequestDebugModal from '../../../components/request-debug-modal'

interface DeliveriesPanelProps {
  items: EntregaItem[]
  loading: boolean
  error: string | null
  onCreateClick: () => void
  onCancel: (item: EntregaItem) => void
  cancelingDeliveryIds: Set<number>
  onReport: (item: EntregaItem, valorEntregado: string) => Promise<boolean>
  reportingDeliveryIds: Set<number>
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return iso
  return `${m[3]}/${m[2]}/${m[1]}`
}

function entTotalLabel(code: number): string {
  if (code === 1) return 'Entregado'
  if (code === 2) return 'No entregado'
  return String(code)
}

/**
 * Formatea dígitos crudos ("12345678") con separador de miles "." (estilo
 * colombiano: "12.345.678"). El valor enviado al backend sigue siendo el raw
 * (sin separadores).
 */
function formatThousands(digits: string): string {
  if (!digits) return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const TOTAL_COLS = 10 // chevron + 8 datos + acción

export default function DeliveriesPanel({
  items,
  loading,
  error,
  onCreateClick,
  onCancel,
  cancelingDeliveryIds,
  onReport,
  reportingDeliveryIds,
}: DeliveriesPanelProps) {
  const [showDebug, setShowDebug] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const loadDeliveriesMeta = useRequestMeta(DELIVERIES_DEBUG_KEYS.load)

  return (
    <div className="flex flex-col gap-3">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Entregas</h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Entregas registradas en SISPRO para esta prescripción.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDebug(true)}
            aria-label="Ver request/response de la petición que trae las entregas"
            title="Ver request/response"
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-600 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <Code2 className="h-3.5 w-3.5" />
            Ver request
          </button>
          <button
            type="button"
            onClick={onCreateClick}
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-[3px] focus:ring-primary/25"
          >
            <Plus className="h-4 w-4" />
            Nueva entrega
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-[12.5px] text-slate-500">
          Cargando entregas...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-[13px] font-semibold text-slate-700">No hay entregas registradas</p>
          <p className="mt-1 text-[11.5px] text-slate-500">
            Clic en <strong>Nueva entrega</strong> para registrar la primera.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-[12.5px]">
              <thead className="border-b border-slate-200 bg-slate-50 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="w-8 px-2 py-2.5"></th>
                  <th className="w-28 px-3 py-2.5 text-left">Estado</th>
                  <th className="px-3 py-2.5 text-left">Direcc. ID</th>
                  <th className="px-3 py-2.5 text-left">Producto</th>
                  <th className="px-3 py-2.5 text-left">Cant.</th>
                  <th className="px-3 py-2.5 text-left">Tipo</th>
                  <th className="px-3 py-2.5 text-left">Fec. entrega</th>
                  <th className="px-3 py-2.5 text-left">Lote</th>
                  <th className="px-3 py-2.5 text-left">Recibió</th>
                  <th className="px-3 py-2.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const status = entregaStatus(item)
                  const active = status !== 'canceled'
                  const canceling = cancelingDeliveryIds.has(item.IDEntrega)
                  const isOpen = expandedId === item.IDEntrega
                  return (
                    <Fragment key={item.IDEntrega}>
                      <tr className={active ? 'hover:bg-slate-50' : 'text-slate-500'}>
                        <td className="px-2 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId((prev) =>
                                prev === item.IDEntrega ? null : item.IDEntrega,
                              )
                            }
                            aria-label={isOpen ? 'Colapsar detalle' : 'Ver detalle completo'}
                            aria-expanded={isOpen}
                            title={isOpen ? 'Colapsar' : 'Ver detalle'}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            />
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          <StatusPill status={status} />
                        </td>
                        <td className="px-3 py-3 font-mono text-slate-700">{item.ID}</td>
                        <td className="px-3 py-3 font-mono">{item.CodSerTecEntregado}</td>
                        <td className={`px-3 py-3 font-mono ${active ? '' : 'line-through'}`}>
                          {item.CantTotEntregada}
                        </td>
                        <td className="px-3 py-3">{entTotalLabel(item.EntTotal)}</td>
                        <td className="px-3 py-3 font-mono">{fmtDate(item.FecEntrega)}</td>
                        <td className="px-3 py-3 font-mono">{item.NoLote || '—'}</td>
                        <td className="px-3 py-3 font-mono">
                          {item.NoIDRecibe ? `${item.TipoIDRecibe} ${item.NoIDRecibe}` : '—'}
                        </td>
                        <td className="px-3 py-3 text-right">
                          {status === 'active' ? (
                            <button
                              type="button"
                              onClick={() => onCancel(item)}
                              disabled={canceling}
                              className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-md border border-rose-200 bg-white px-2.5 text-[11.5px] font-bold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {canceling ? (
                                <>
                                  <span className="inline-block h-2.5 w-2.5 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
                                  Anulando…
                                </>
                              ) : (
                                <>
                                  <X className="h-3 w-3" />
                                  Anular
                                </>
                              )}
                            </button>
                          ) : status === 'canceled' ? (
                            <span className="text-[10.5px] italic text-slate-400">
                              anulada {fmtDate(item.FecAnulacion)}
                            </span>
                          ) : (
                            <span className="text-[10.5px] italic text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-slate-50/60">
                          <td className="px-2 py-3"></td>
                          <td colSpan={TOTAL_COLS - 1} className="px-3 py-3">
                            <ExpandedDeliveryFields
                              item={item}
                              status={status}
                              onReport={onReport}
                              reporting={reportingDeliveryIds.has(item.IDEntrega)}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showDebug && (
        <RequestDebugModal
          title="Entregas · GET /mipres/delivery/prescription/{n}"
          meta={loadDeliveriesMeta}
          onClose={() => setShowDebug(false)}
        />
      )}
    </div>
  )
}

interface ExpandedDeliveryFieldsProps {
  item: EntregaItem
  status: EntregaStatus
  onReport: (item: EntregaItem, valorEntregado: string) => Promise<boolean>
  reporting: boolean
}

function ExpandedDeliveryFields({ item, status, onReport, reporting }: ExpandedDeliveryFieldsProps) {
  const [valor, setValor] = useState('')

  const handleReport = async () => {
    const trimmed = valor.trim()
    if (!trimmed) return
    const ok = await onReport(item, trimmed)
    if (ok) setValor('')
  }

  const fields: Array<{ label: string; value: string | number | null }> = [
    { label: 'IDEntrega', value: item.IDEntrega },
    { label: 'ID (Direccionamiento)', value: item.ID },
    { label: 'NoPrescripcion', value: item.NoPrescripcion },
    { label: 'TipoTec', value: item.TipoTec },
    { label: 'ConTec', value: item.ConTec },
    { label: 'NoEntrega', value: item.NoEntrega },
    { label: 'TipoIDPaciente', value: item.TipoIDPaciente },
    { label: 'NoIDPaciente', value: item.NoIDPaciente },
    { label: 'CodSerTecEntregado', value: item.CodSerTecEntregado },
    { label: 'CantTotEntregada', value: item.CantTotEntregada },
    { label: 'EntTotal', value: item.EntTotal },
    { label: 'CausaNoEntrega', value: item.CausaNoEntrega ?? '—' },
    { label: 'FecEntrega', value: item.FecEntrega },
    { label: 'NoLote', value: item.NoLote },
    { label: 'TipoIDRecibe', value: item.TipoIDRecibe },
    { label: 'NoIDRecibe', value: item.NoIDRecibe },
    { label: 'EstEntrega', value: item.EstEntrega },
    { label: 'FecAnulacion', value: item.FecAnulacion ?? '—' },
    {
      label: 'CodigosEntrega',
      value: item.CodigosEntrega == null ? '—' : JSON.stringify(item.CodigosEntrega),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-[12px] sm:grid-cols-2 lg:grid-cols-3">
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

      {status === 'active' && (
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-[11.5px] font-bold uppercase tracking-wider text-slate-600">
            Reporte de entrega
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={formatThousands(valor)}
              onChange={(e) => setValor(e.target.value.replace(/\D/g, ''))}
              disabled={reporting}
              placeholder="valor"
              className="h-9 w-40 rounded-md border border-slate-300 bg-white px-3 font-mono text-sm font-semibold text-slate-900 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
            <button
              type="button"
              onClick={handleReport}
              disabled={reporting || !valor.trim()}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3.5 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-[3px] focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {reporting ? (
                <>
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Reportando…
                </>
              ) : (
                'Reportar'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusPill({ status }: { status: EntregaStatus }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700">
        <CircleCheck className="h-3 w-3" /> Activa
      </span>
    )
  }
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10.5px] font-bold text-blue-700">
        <CircleCheck className="h-3 w-3" /> Completada
      </span>
    )
  }
  if (status === 'canceled') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10.5px] font-bold text-rose-700">
        <CircleX className="h-3 w-3" /> Anulada
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-slate-600">
      —
    </span>
  )
}
