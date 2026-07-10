import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Divide,
  MessageSquare,
  Truck,
  X,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import type { BulkDeliveryLine, FilingEventDetail } from '../services/filing-event.service'
import { useRegisterDeliveryBulk } from '../hooks/use-register-delivery-bulk'

type DeliveryType = 'COMPLETA' | 'PARCIAL' | 'SIN_EXISTENCIAS'

interface RowState {
  type: DeliveryType | null
  qty: string
  comment: string
  commentOpen: boolean
}

const EMPTY: RowState = { type: null, qty: '', comment: '', commentOpen: false }
const LABEL = 'text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'

const OPTIONS: { type: DeliveryType; icon: typeof CheckCircle2; title: string }[] = [
  { type: 'COMPLETA', icon: CheckCircle2, title: 'Total' },
  { type: 'PARCIAL', icon: Divide, title: 'Parcial' },
  { type: 'SIN_EXISTENCIAS', icon: XCircle, title: 'Sin existencias' },
]

/** Modal de entrega de toda la radicación: una fila por medicamento/insumo, opciones por fila. */
export function DeliveryModal({
  filing,
  onClose,
}: {
  filing: FilingEventDetail
  onClose: () => void
}) {
  const [rows, setRows] = useState<Record<number, RowState>>(() =>
    Object.fromEntries(filing.items.map((it) => [it.id, { ...EMPTY }])),
  )
  const mutation = useRegisterDeliveryBulk(filing.id)

  const setRow = (id: number, patch: Partial<RowState>) =>
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))

  // Construye las líneas a enviar. TODAS las líneas con pendiente deben tener una opción válida.
  const pendingItems = filing.items.filter((it) => it.quantityPending > 0)
  const lines: BulkDeliveryLine[] = []
  let allResolved = true
  for (const it of pendingItems) {
    const r = rows[it.id]
    const comment = r?.comment.trim() || undefined
    if (!r || r.type == null) {
      allResolved = false
      continue
    }
    if (r.type === 'PARCIAL') {
      const n = parseInt(r.qty, 10)
      if (Number.isNaN(n) || n < 1 || n >= it.quantityPending) {
        allResolved = false
        continue
      }
      lines.push({ itemId: it.id, deliveryType: 'PARCIAL', quantity: n, comment })
    } else if (r.type === 'COMPLETA') {
      lines.push({ itemId: it.id, deliveryType: 'COMPLETA', quantity: it.quantityPending, comment })
    } else {
      lines.push({ itemId: it.id, deliveryType: 'SIN_EXISTENCIAS', comment })
    }
  }

  // Solo se puede registrar cuando TODAS las líneas pendientes están resueltas.
  const canSubmit =
    pendingItems.length > 0 &&
    allResolved &&
    lines.length === pendingItems.length &&
    !mutation.isPending

  function submit() {
    if (!canSubmit) return
    mutation.mutate(lines, {
      onSuccess: () => {
        toast.success('Entrega registrada')
        onClose()
      },
      onError: (err) => {
        const msg =
          typeof err === 'object' && err && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'No se pudo registrar la entrega'
        toast.error(msg)
      },
    })
  }

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto border-t border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Truck className="h-4 w-4 text-primary" />
            <h3 className="font-heading text-sm font-bold text-foreground">Registrar entrega</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-border bg-background p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabla de medicamentos/insumos */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th className={`px-5 py-2.5 font-semibold ${LABEL}`}>Medicamento</th>
                <th className={`px-4 py-2.5 text-right font-semibold ${LABEL}`}>Pendiente</th>
                <th className={`px-4 py-2.5 font-semibold ${LABEL}`}>Entrega</th>
                <th className={`px-4 py-2.5 text-right font-semibold ${LABEL}`}>Cantidad</th>
                <th className={`px-4 py-2.5 text-right font-semibold ${LABEL}`}>Comentario</th>
              </tr>
            </thead>
            <tbody>
              {filing.items.map((it) => {
                const r = rows[it.id] ?? EMPTY
                const done = it.quantityPending <= 0
                const hadDelivery = it.quantityDelivered > 0
                const parcialErr =
                  r.type === 'PARCIAL' &&
                  r.qty !== '' &&
                  (() => {
                    const n = parseInt(r.qty, 10)
                    return Number.isNaN(n) || n < 1 || n >= it.quantityPending
                  })()
                return (
                  <FragmentRow key={it.id}>
                    <tr className="border-b border-border align-top">
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-foreground">{it.shortName}</div>
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-sm font-medium text-foreground">
                        {it.quantityPending}
                      </td>
                      <td className="px-4 py-4">
                        {done ? (
                          <span className="text-[13px] text-muted-foreground">Entregado</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {OPTIONS.map((opt) => {
                              const active = r.type === opt.type
                              const blocked = opt.type === 'SIN_EXISTENCIAS' && hadDelivery
                              return (
                                <button
                                  key={opt.type}
                                  type="button"
                                  disabled={blocked}
                                  onClick={() => {
                                    if (blocked) return
                                    setRow(it.id, {
                                      type: opt.type,
                                      qty: opt.type === 'PARCIAL' ? r.qty : '',
                                    })
                                  }}
                                  title={blocked ? 'No disponible: ya hubo una entrega' : opt.title}
                                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                                    blocked
                                      ? 'cursor-not-allowed border-border text-muted-foreground opacity-40'
                                      : active
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-border text-foreground hover:bg-muted'
                                  }`}
                                >
                                  <opt.icon className="h-3.5 w-3.5" />
                                  {opt.title}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {r.type === 'PARCIAL' && !done ? (
                          <div className="inline-flex flex-col items-end">
                            <input
                              type="number"
                              min={1}
                              max={it.quantityPending - 1}
                              step={1}
                              value={r.qty}
                              onChange={(e) => setRow(it.id, { qty: e.target.value })}
                              placeholder={`1 – ${it.quantityPending - 1}`}
                              className="w-28 rounded-lg border border-border bg-background px-3 py-1.5 text-right font-mono text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            {parcialErr && (
                              <span className="mt-1 text-[11px] text-[#ee5253]">
                                1 – {it.quantityPending - 1}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {done ? (
                          <span className="text-sm text-muted-foreground">—</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setRow(it.id, { commentOpen: !r.commentOpen })}
                            aria-expanded={r.commentOpen}
                            title="Comentario"
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-muted"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-primary" />
                            {r.comment.trim() ? 'Editar' : 'Agregar'}
                            <ChevronDown
                              className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${r.commentOpen ? 'rotate-180' : ''}`}
                            />
                          </button>
                        )}
                      </td>
                    </tr>
                    {r.commentOpen && !done && (
                      <tr className="border-b border-border bg-muted/20">
                        <td colSpan={5} className="px-5 py-3">
                          <textarea
                            rows={2}
                            value={r.comment}
                            onChange={(e) => setRow(it.id, { comment: e.target.value })}
                            placeholder={`Comentario para ${it.shortName}`}
                            className="w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-[13px] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </td>
                      </tr>
                    )}
                  </FragmentRow>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-border bg-background px-4 py-2 text-[13px] font-medium text-muted-foreground hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={submit}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check className="h-4 w-4" />
            {mutation.isPending ? 'Registrando…' : 'Registrar entrega'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** Agrupa la fila principal + la fila de comentario sin envoltorio DOM extra. */
function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
