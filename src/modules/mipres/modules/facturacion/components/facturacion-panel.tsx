import { Fragment, useState } from 'react'
import { ChevronDown, CircleCheck, CircleX, Code2, Copy, X } from 'lucide-react'
import { toast } from 'sonner'
import type { FacturacionItem } from '../types/facturacion.types'
import { FACTURACION_DEBUG_KEYS } from '../services/facturacion.service'
import { useRequestMeta } from '../../../../../lib/request-log'
import RequestDebugModal from '../../../components/request-debug-modal'

interface FacturacionPanelProps {
  items: FacturacionItem[]
  loading: boolean
  error: string | null
  onCancel: (item: FacturacionItem) => void
  cancelingIds: Set<number>
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return iso
  return `${m[3]}/${m[2]}/${m[1]}`
}

function fmtMoney(n: number): string {
  if (!Number.isFinite(n)) return String(n)
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const TOTAL_COLS = 9 // chevron + 7 datos + acción

export default function FacturacionPanel({
  items,
  loading,
  error,
  onCancel,
  cancelingIds,
}: FacturacionPanelProps) {
  const [showDebug, setShowDebug] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const loadMeta = useRequestMeta(FACTURACION_DEBUG_KEYS.load)

  return (
    <div className="flex flex-col gap-3">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Facturaciones</h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Facturaciones registradas en SISPRO para esta prescripción.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowDebug(true)}
          aria-label="Ver request/response de la petición que trae las facturaciones"
          title="Ver request/response"
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-600 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          <Code2 className="h-3.5 w-3.5" />
          Ver request
        </button>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-[12.5px] text-slate-500">
          Cargando facturaciones...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-[13px] font-semibold text-slate-700">
            No hay facturaciones para esta prescripción
          </p>
          <p className="mt-1 text-[11.5px] text-slate-500">
            Las facturaciones se generan desde el tool <strong>R. Entrega</strong>, sobre cada reporte de entrega activo.
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
                  <th className="px-3 py-2.5 text-left">ID Facturación</th>
                  <th className="px-3 py-2.5 text-left">No. Factura</th>
                  <th className="px-3 py-2.5 text-left">Producto</th>
                  <th className="px-3 py-2.5 text-left">Cant.</th>
                  <th className="px-3 py-2.5 text-left">Valor total</th>
                  <th className="px-3 py-2.5 text-left">Fec. facturación</th>
                  <th className="px-3 py-2.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const active = item.FecAnulacion === null
                  const canceling = cancelingIds.has(item.IDFacturacion)
                  const isOpen = expandedId === item.IDFacturacion
                  return (
                    <Fragment key={item.IDFacturacion}>
                      <tr className={active ? 'hover:bg-slate-50' : 'text-slate-500'}>
                        <td className="px-2 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId((prev) =>
                                prev === item.IDFacturacion ? null : item.IDFacturacion,
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
                          {active ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700">
                              <CircleCheck className="h-3 w-3" /> Activa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10.5px] font-bold text-rose-700">
                              <CircleX className="h-3 w-3" /> Anulada
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <CopyableId value={item.IDFacturacion} />
                        </td>
                        <td className="px-3 py-3 font-mono">{item.NoFactura}</td>
                        <td className="px-3 py-3 font-mono">{item.CodSerTecAEntregado}</td>
                        <td className="px-3 py-3 font-mono">{item.CantUnMinDis}</td>
                        <td className={`px-3 py-3 font-mono ${active ? '' : 'line-through'}`}>
                          {fmtMoney(item.ValorTotFacturado)}
                        </td>
                        <td className="px-3 py-3 font-mono">{item.FecFacturacion}</td>
                        <td className="px-3 py-3 text-right">
                          {active ? (
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
                          ) : (
                            <span className="text-[10.5px] italic text-slate-400">
                              anulada {fmtDate(item.FecAnulacion)}
                            </span>
                          )}
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-slate-50/60">
                          <td className="px-2 py-3"></td>
                          <td colSpan={TOTAL_COLS - 1} className="px-3 py-3">
                            <ExpandedFacturacionFields item={item} />
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
          title="Facturaciones · GET /mipres/facturacion/prescription/{n}"
          meta={loadMeta}
          onClose={() => setShowDebug(false)}
        />
      )}
    </div>
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
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-1 -mx-1 font-mono text-[12.5px] font-bold text-slate-900 transition-colors hover:bg-primary/5 hover:text-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
    >
      <span>{value}</span>
      <Copy className={`h-3.5 w-3.5 transition-colors ${copied ? 'text-emerald-600' : 'text-slate-400'}`} />
    </button>
  )
}

function ExpandedFacturacionFields({ item }: { item: FacturacionItem }) {
  const fields: Array<{ label: string; value: string | number | null }> = [
    { label: 'IDFacturacion', value: item.IDFacturacion },
    { label: 'ID (Entrega)', value: item.ID },
    { label: 'NoPrescripcion', value: item.NoPrescripcion },
    { label: 'TipoTec', value: item.TipoTec },
    { label: 'ConTec', value: item.ConTec },
    { label: 'TipoIDPaciente', value: item.TipoIDPaciente },
    { label: 'NoIDPaciente', value: item.NoIDPaciente },
    { label: 'NoEntrega', value: item.NoEntrega },
    { label: 'NoSubEntrega', value: item.NoSubEntrega },
    { label: 'NoFactura', value: item.NoFactura },
    { label: 'NoIDEPS', value: item.NoIDEPS },
    { label: 'CodEPS', value: item.CodEPS },
    { label: 'CodSerTecAEntregado', value: item.CodSerTecAEntregado },
    { label: 'CantUnMinDis', value: item.CantUnMinDis },
    { label: 'ValorUnitFacturado', value: fmtMoney(item.ValorUnitFacturado) },
    { label: 'ValorTotFacturado', value: fmtMoney(item.ValorTotFacturado) },
    { label: 'CuotaModer', value: item.CuotaModer },
    { label: 'Copago', value: item.Copago },
    { label: 'FecFacturacion', value: item.FecFacturacion },
    { label: 'EstFacturacion', value: item.EstFacturacion },
    { label: 'CodigosFacturacion', value: item.CodigosFacturacion == null ? '—' : JSON.stringify(item.CodigosFacturacion) },
    { label: 'FecAnulacion', value: item.FecAnulacion ?? '—' },
  ]

  return (
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
  )
}
