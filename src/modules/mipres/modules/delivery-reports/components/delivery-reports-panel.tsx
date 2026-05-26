import { Fragment, useMemo, useState } from 'react'
import { ChevronDown, CircleCheck, CircleX, Code2, Copy, Receipt, X } from 'lucide-react'
import { toast } from 'sonner'
import type { FacturacionInput, ReporteEntregaItem } from '../types/delivery-reports.types'
import type { RoutingItem } from '../../routings/types/routings.types'
import { DELIVERY_REPORTS_DEBUG_KEYS } from '../services/delivery-reports.service'
import { useRequestMeta } from '../../../../../lib/request-log'
import RequestDebugModal from '../../../components/request-debug-modal'

interface DeliveryReportsPanelProps {
  items: ReporteEntregaItem[]
  loading: boolean
  error: string | null
  onCancel: (item: ReporteEntregaItem) => void
  cancelingIds: Set<number>
  onFacturacion: (input: FacturacionInput) => Promise<boolean>
  facturando: boolean
  routings: RoutingItem[]
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

export default function DeliveryReportsPanel({
  items,
  loading,
  error,
  onCancel,
  cancelingIds,
  onFacturacion,
  facturando,
  routings,
}: DeliveryReportsPanelProps) {
  const [showDebug, setShowDebug] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const loadMeta = useRequestMeta(DELIVERY_REPORTS_DEBUG_KEYS.load)

  return (
    <div className="flex flex-col gap-3">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Reportes de entrega</h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Reportes registrados en SISPRO para esta prescripción.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowDebug(true)}
          aria-label="Ver request/response de la petición que trae los reportes"
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
          Cargando reportes...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-[13px] font-semibold text-slate-700">
            No hay reportes de entrega para esta prescripción
          </p>
          <p className="mt-1 text-[11.5px] text-slate-500">
            Los reportes se crean desde el tool <strong>Entregas</strong>, en cada entrega activa.
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
                  <th className="px-3 py-2.5 text-left">ID Reporte</th>
                  <th className="px-3 py-2.5 text-left">ID Entrega</th>
                  <th className="px-3 py-2.5 text-left">Producto</th>
                  <th className="px-3 py-2.5 text-left">Cant.</th>
                  <th className="px-3 py-2.5 text-left">Valor</th>
                  <th className="px-3 py-2.5 text-left">Fec. reporte</th>
                  <th className="px-3 py-2.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const active = item.FecAnulacion === null
                  const canceling = cancelingIds.has(item.IDReporteEntrega)
                  const isOpen = expandedId === item.IDReporteEntrega
                  return (
                    <Fragment key={item.IDReporteEntrega}>
                      <tr className={active ? 'hover:bg-slate-50' : 'text-slate-500'}>
                        <td className="px-2 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId((prev) =>
                                prev === item.IDReporteEntrega ? null : item.IDReporteEntrega,
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
                              <CircleCheck className="h-3 w-3" /> Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10.5px] font-bold text-rose-700">
                              <CircleX className="h-3 w-3" /> Anulado
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <CopyableId value={item.IDReporteEntrega} />
                        </td>
                        <td className="px-3 py-3 font-mono text-slate-700">{item.ID}</td>
                        <td className="px-3 py-3 font-mono">{item.CodTecEntregado}</td>
                        <td className="px-3 py-3 font-mono">{item.CantTotEntregada}</td>
                        <td className={`px-3 py-3 font-mono ${active ? '' : 'line-through'}`}>
                          {fmtMoney(item.ValorEntregado)}
                        </td>
                        <td className="px-3 py-3 font-mono">{item.FecRepEntrega}</td>
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
                              anulado {fmtDate(item.FecAnulacion)}
                            </span>
                          )}
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-slate-50/60">
                          <td className="px-2 py-3"></td>
                          <td colSpan={TOTAL_COLS - 1} className="px-3 py-3">
                            <ExpandedReportFields
                              item={item}
                              active={active}
                              onFacturacion={onFacturacion}
                              facturando={facturando}
                              routings={routings}
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
          title="Reportes de entrega · GET /mipres/delivery-report/prescription/{n}"
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

function ExpandedReportFields({
  item,
  active,
  onFacturacion,
  facturando,
  routings,
}: {
  item: ReporteEntregaItem
  active: boolean
  onFacturacion: (input: FacturacionInput) => Promise<boolean>
  facturando: boolean
  routings: RoutingItem[]
}) {
  const fields: Array<{ label: string; value: string | number | null }> = [
    { label: 'IDReporteEntrega', value: item.IDReporteEntrega },
    { label: 'ID (Entrega)', value: item.ID },
    { label: 'NoPrescripcion', value: item.NoPrescripcion },
    { label: 'TipoTec', value: item.TipoTec },
    { label: 'ConTec', value: item.ConTec },
    { label: 'NoEntrega', value: item.NoEntrega },
    { label: 'TipoIDPaciente', value: item.TipoIDPaciente },
    { label: 'NoIDPaciente', value: item.NoIDPaciente },
    { label: 'CodTecEntregado', value: item.CodTecEntregado },
    { label: 'CantTotEntregada', value: item.CantTotEntregada },
    { label: 'NoLote', value: item.NoLote },
    { label: 'EstadoEntrega', value: item.EstadoEntrega },
    { label: 'CausaNoEntrega', value: item.CausaNoEntrega ?? '—' },
    { label: 'ValorEntregado', value: fmtMoney(item.ValorEntregado) },
    { label: 'FecEntrega', value: item.FecEntrega },
    { label: 'FecRepEntrega', value: item.FecRepEntrega },
    { label: 'EstRepEntrega', value: item.EstRepEntrega },
    { label: 'FecAnulacion', value: item.FecAnulacion ?? '—' },
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
      {active && (
        <InlineFacturacionForm
          item={item}
          onFacturacion={onFacturacion}
          facturando={facturando}
          routings={routings}
        />
      )}
    </div>
  )
}

function InlineFacturacionForm({
  item,
  onFacturacion,
  facturando,
  routings,
}: {
  item: ReporteEntregaItem
  onFacturacion: (input: FacturacionInput) => Promise<boolean>
  facturando: boolean
  routings: RoutingItem[]
}) {
  const prefilledValorUnit = useMemo(() => {
    const cant = Number(item.CantTotEntregada)
    if (!Number.isFinite(cant) || cant <= 0) return ''
    return String(Math.ceil(item.ValorEntregado / cant))
  }, [item.CantTotEntregada, item.ValorEntregado])

  const [idDireccionamiento, setIdDireccionamiento] = useState('')
  const [noFactura, setNoFactura] = useState('')
  const [valorUnit, setValorUnit] = useState('')
  const [valorUnitTouched, setValorUnitTouched] = useState(false)
  const [pendingPayload, setPendingPayload] = useState<FacturacionInput | null>(null)
  const effectiveValorUnit = valorUnitTouched ? valorUnit : prefilledValorUnit

  const matchedRouting = useMemo(() => {
    const n = Number(idDireccionamiento)
    if (!Number.isFinite(n) || n <= 0) return null
    return routings.find((r) => r.ID === n) ?? null
  }, [idDireccionamiento, routings])

  const canGenerate =
    !facturando &&
    !!matchedRouting &&
    /^[A-Za-z0-9_-]+$/.test(noFactura) &&
    /^\d{1,10}$/.test(effectiveValorUnit)

  const handleGenerate = () => {
    if (!matchedRouting) {
      toast.error('No existe un direccionamiento con ese ID en la prescripción')
      return
    }
    const payload: FacturacionInput = {
      NoPrescripcion: matchedRouting.NoPrescripcion,
      TipoTec: matchedRouting.TipoTec,
      ConTec: matchedRouting.ConTec,
      TipoIDPaciente: matchedRouting.TipoIDPaciente,
      NoIDPaciente: matchedRouting.NoIDPaciente,
      NoEntrega: matchedRouting.NoEntrega,
      NoSubEntrega: 0,
      NoFactura: noFactura,
      NoIDEPS: matchedRouting.NoIDEPS,
      CodEPS: matchedRouting.CodEPS,
      CodSerTecAEntregado: matchedRouting.CodSerTecAEntregar,
      CantUnMinDis: item.CantTotEntregada,
      ValorUnitFacturado: effectiveValorUnit,
      ValorTotFacturado: String(item.ValorEntregado),
      CuotaModer: '0',
      Copago: '0',
    }
    setPendingPayload(payload)
  }

  const handleConfirm = async () => {
    if (!pendingPayload) return
    const ok = await onFacturacion(pendingPayload)
    if (ok) {
      setIdDireccionamiento('')
      setNoFactura('')
      setValorUnit('')
      setValorUnitTouched(false)
    }
    setPendingPayload(null)
  }

  const handleCancelModal = () => {
    if (facturando) return
    setPendingPayload(null)
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white p-3">
      <header className="mb-2.5 flex items-center gap-2">
        <Receipt className="h-3.5 w-3.5 text-primary" />
        <h4 className="text-[12.5px] font-bold text-slate-900">Facturar este reporte</h4>
      </header>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
            ID de direccionamiento
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={idDireccionamiento}
            onChange={(e) => setIdDireccionamiento(e.target.value.replace(/\D+/g, ''))}
            placeholder="digite el ID del direccionamiento"
            disabled={facturando}
            className="h-9 rounded-md border border-slate-300 bg-white px-2.5 font-mono text-[12.5px] text-slate-900 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/20"
          />
          {idDireccionamiento && !matchedRouting && (
            <span className="text-[11px] font-semibold text-rose-600">
              No existe un direccionamiento con ID {idDireccionamiento} en esta prescripción.
            </span>
          )}
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
            No. factura
          </span>
          <input
            type="text"
            value={noFactura}
            onChange={(e) => setNoFactura(e.target.value)}
            placeholder="alfanumérico (A-Z 0-9 _ -)"
            disabled={facturando}
            className="h-9 rounded-md border border-slate-300 bg-white px-2.5 font-mono text-[12.5px] text-slate-900 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/20"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
            Valor unitario facturado <span className="text-slate-400">· prellenado, editable</span>
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={effectiveValorUnit}
            onChange={(e) => {
              setValorUnit(e.target.value.replace(/\D+/g, ''))
              setValorUnitTouched(true)
            }}
            disabled={facturando}
            className="h-9 rounded-md border border-slate-300 bg-white px-2.5 font-mono text-[12.5px] text-slate-900 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/20"
          />
        </label>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3.5 text-[12.5px] font-bold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Receipt className="h-3.5 w-3.5" />
          Generar
        </button>
      </div>
      {pendingPayload && (
        <FacturacionConfirmModal
          payload={pendingPayload}
          onConfirm={handleConfirm}
          onCancel={handleCancelModal}
          submitting={facturando}
        />
      )}
    </section>
  )
}

function FacturacionConfirmModal({
  payload,
  onConfirm,
  onCancel,
  submitting,
}: {
  payload: FacturacionInput
  onConfirm: () => void
  onCancel: () => void
  submitting: boolean
}) {
  const entries = Object.entries(payload) as Array<[keyof FacturacionInput, string | number]>

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="facturacion-confirm-title"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !submitting) onCancel()
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <header className="flex items-center gap-2 border-b border-slate-200 bg-primary/5 px-5 py-3">
          <Receipt className="h-4 w-4 text-primary" />
          <h3 id="facturacion-confirm-title" className="text-[14px] font-bold text-slate-900">
            Confirmar facturación
          </h3>
        </header>
        <p className="px-5 pt-3 text-[12.5px] text-slate-600">
          Revise el payload que se enviará a SISPRO. Esta acción es irreversible: una vez confirmada,
          la factura queda registrada y no se puede modificar.
        </p>
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-[12px] sm:grid-cols-2">
            {entries.map(([key, value]) => (
              <div
                key={key}
                className="flex items-baseline justify-between gap-3 border-b border-slate-200/70 py-1"
              >
                <dt className="font-mono text-slate-500">{key}</dt>
                <dd className="m-0 truncate font-mono font-semibold text-slate-900" title={String(value)}>
                  {String(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-slate-300 bg-white px-3.5 text-[12.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3.5 text-[12.5px] font-bold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? (
              <>
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Facturando…
              </>
            ) : (
              <>
                <Receipt className="h-3.5 w-3.5" />
                Confirmar
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  )
}
