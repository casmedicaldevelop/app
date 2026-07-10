import { useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarDays, Eye, FileText, Ticket, Truck, X } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import type { FilingDeliveryRow, FilingEventDetail } from '../services/filing-event.service'
import { filingEventService } from '../services/filing-event.service'
import { useCompany } from '../../company/hooks/useCompany'
import { renderFacturaProceso } from '../lib/formato'
import { renderPendingTicket } from '../lib/ticket'

const LABEL = 'text-[11px] uppercase tracking-wider text-muted-foreground'

const DELIVERY_TYPE_LABEL: Record<string, string> = {
  COMPLETA: 'Completa',
  PARCIAL: 'Parcial',
  SIN_EXISTENCIAS: 'Sin existencias',
}

function fmtDate(iso: string): string {
  const [y, m, dd] = iso.slice(0, 10).split('-')
  return y && m && dd ? `${y}/${m}/${dd}` : '—'
}

/** Agrupa las entregas por lote, preservando el orden de aparición. */
function groupByBatch(rows: FilingDeliveryRow[]): { batch: string; rows: FilingDeliveryRow[] }[] {
  const map = new Map<string, FilingDeliveryRow[]>()
  for (const r of rows) {
    const key = r.deliveryBatch ?? '—'
    const arr = map.get(key)
    if (arr) arr.push(r)
    else map.set(key, [r])
  }
  return [...map.entries()].map(([batch, rows]) => ({ batch, rows }))
}

/**
 * Modal que pide la fecha del documento (factura/ticket) del lote antes de imprimir.
 * Con `allowNoDate` (solo la factura) aparece el botón "Sin fecha": el documento sale con la
 * casilla en blanco para llenarla a mano y no se guarda nada en la base.
 */
function InvoiceDateModal({
  initial,
  allowNoDate,
  saving,
  onConfirm,
  onClose,
}: {
  initial: string
  allowNoDate: boolean
  saving: boolean
  onConfirm: (date: string | null) => void
  onClose: () => void
}) {
  const [date, setDate] = useState(initial)
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={saving ? undefined : onClose} aria-hidden />
      <div className="relative z-10 w-[min(92vw,480px)] rounded-2xl border border-border bg-background p-6 shadow-2xl">
        <div className="flex items-center gap-2.5">
          <CalendarDays className="h-4 w-4 text-primary" />
          <h3 className="font-heading text-sm font-bold text-foreground">Fecha del documento</h3>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Con esta fecha saldrán impresos la factura y el ticket de este lote. No cambia la fecha real de la entrega.
        </p>
        <input
          type="date"
          value={date}
          disabled={saving}
          autoFocus
          onChange={(e) => setDate(e.target.value)}
          className="mt-4 h-10 w-full rounded-lg border border-input px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/20 disabled:opacity-60"
        />
        {/* Sin fecha a la izquierda, Continuar a la derecha. Se cierra dando clic afuera. */}
        <div className={`mt-6 flex items-center gap-2 ${allowNoDate ? 'justify-between' : 'justify-end'}`}>
          {allowNoDate && (
            <button
              type="button"
              onClick={() => onConfirm(null)}
              disabled={saving}
              className="h-9 cursor-pointer whitespace-nowrap rounded-lg border border-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              Sin fecha
            </button>
          )}
          <button
            type="button"
            onClick={() => onConfirm(date)}
            disabled={saving || !date}
            className="h-9 cursor-pointer whitespace-nowrap rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** Tabla de entregas: una fila por lote, con ticket, factura y detalle. El desglose va en el modal. */
export function DeliveriesByBatch({
  filing,
  deliveries,
}: {
  filing: FilingEventDetail
  deliveries: FilingDeliveryRow[]
}) {
  const { data: company } = useCompany()
  const qc = useQueryClient()
  const [detailBatch, setDetailBatch] = useState<string | null>(null)
  // Modal de fecha: guarda qué lote, si admite "Sin fecha", y cómo imprimir el documento.
  const [dateModal, setDateModal] = useState<{
    batch: string
    initial: string
    allowNoDate: boolean
    print: (w: Window, date: string | null) => void | Promise<void>
  } | null>(null)
  const [savingDate, setSavingDate] = useState(false)
  const groups = groupByBatch(deliveries)
  // La radicación quedó totalmente entregada cuando ninguna línea tiene pendiente.
  const fullyDelivered = filing.items.every((it) => it.quantityPending <= 0)

  // Fecha de factura ya guardada del lote (si existe), en formato YYYY-MM-DD para el input.
  const initialDate = (rows: FilingDeliveryRow[]) =>
    rows[0]?.invoiceDate ? rows[0].invoiceDate.slice(0, 10) : ''

  function requestFactura(
    lines: { cum: string; description: string; quantity: number }[],
    rows: FilingDeliveryRow[],
    batch: string,
  ) {
    if (!lines.length) return
    setDateModal({
      batch,
      initial: initialDate(rows),
      allowNoDate: true, // la factura puede imprimirse sin fecha, para llenarla a mano
      print: (w, date) => {
        renderFacturaProceso(w, { company, filing, batchCode: batch, lines, invoiceDate: date })
      },
    })
  }

  function requestTicket(rows: FilingDeliveryRow[], batch: string) {
    const lines = rows
      .filter((r) => r.quantityPendingAfter > 0)
      .map((r) => ({ name: r.medication, pending: r.quantityPendingAfter }))
    if (!lines.length) return
    setDateModal({
      batch,
      initial: initialDate(rows),
      allowNoDate: false, // el ticket de pendiente siempre exige fecha
      print: async (w, date) => {
        if (date === null) return
        w.document.write('<p style="font:14px sans-serif;padding:16px">Generando ticket…</p>')
        try {
          const { shelfCode } = await filingEventService.assignShelfCode(filing.id)
          renderPendingTicket(w, { company, filing, shelfCode, lines, invoiceDate: date })
        } catch {
          w.document.body.innerHTML =
            '<p style="font:14px sans-serif;padding:16px;color:#b91c1c">No se pudo generar el ticket.</p>'
        }
      },
    })
  }

  // Guarda la fecha del lote (sobrescribe la última) y luego imprime el documento con esa fecha.
  // Con "Sin fecha" (date === null) no se toca la base: la invoice_date previa del lote queda intacta.
  // La ventana se abre de forma síncrona (dentro del clic) para no ser bloqueada por el navegador.
  async function confirmDate(date: string | null) {
    if (!dateModal) return
    const w = window.open('', '_blank')
    if (!w) {
      toast.error('Permitá las ventanas emergentes para imprimir')
      return
    }
    if (date === null) {
      await dateModal.print(w, null)
      setDateModal(null)
      return
    }
    setSavingDate(true)
    try {
      await filingEventService.setBatchInvoiceDate(filing.id, dateModal.batch, date)
      void qc.invalidateQueries({ queryKey: ['filing-event', filing.id, 'all-deliveries'] })
      await dateModal.print(w, date)
      setDateModal(null)
    } catch (err) {
      w.close()
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar la fecha')
    } finally {
      setSavingDate(false)
    }
  }

  const detailGroup = groups.find((g) => g.batch === detailBatch) ?? null

  return (
    <div className="overflow-x-auto border-t border-border">
      <table className="w-full min-w-[820px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border bg-muted/60">
            <th className={`px-5 py-2.5 font-semibold ${LABEL}`}>Lote</th>
            <th className={`px-4 py-2.5 font-semibold ${LABEL}`}>Fecha de registro</th>
            <th className={`px-4 py-2.5 font-semibold ${LABEL}`}>Fecha de entrega</th>
            <th className={`px-5 py-2.5 text-right font-semibold ${LABEL}`}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g, idx) => {
            const hasPending = g.rows.some((r) => r.quantityPendingAfter > 0)
            // El último lote, si la radicación quedó completa, genera la factura FINAL consolidada
            // (todos los medicamentos del radicado con su cantidad total, todo entregado).
            const isFinal = idx === groups.length - 1 && fullyDelivered
            const facturaLines = isFinal
              ? filing.items.map((it) => ({ cum: it.cum, description: it.name, quantity: it.quantity }))
              : g.rows
                  .filter((r) => r.quantityDelivered > 0)
                  .map((r) => ({ cum: r.cum, description: r.name, quantity: r.quantityDelivered }))
            return (
              <tr key={g.batch} className="border-b border-border">
                <td className="px-5 py-3 font-mono text-[13px] font-semibold text-foreground">
                  {g.batch}
                </td>
                <td className="px-4 py-3 font-mono text-[13px] text-foreground whitespace-nowrap">
                  {fmtDate(g.rows[0].createdAt)}
                </td>
                <td className="px-4 py-3 font-mono text-[13px] whitespace-nowrap">
                  {g.rows[0].invoiceDate ? (
                    <span className="text-foreground">{fmtDate(g.rows[0].invoiceDate)}</span>
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => requestFactura(facturaLines, g.rows, g.batch)}
                      title={isFinal ? 'Ver / imprimir factura final (entrega completa)' : 'Ver / imprimir factura de entrega'}
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-input text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => requestTicket(g.rows, g.batch)}
                      disabled={!hasPending}
                      title={hasPending ? 'Ver / imprimir ticket de pendiente' : 'Sin pendientes en este lote'}
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-input text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Ticket className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailBatch(g.batch)}
                      className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-input px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver detalle
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {detailGroup &&
        createPortal(
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setDetailBatch(null)}
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto border-t border-border bg-background shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-4 py-3.5 sm:px-6">
                <div className="flex items-center gap-2.5">
                  <Truck className="h-4 w-4 text-primary" />
                  <h3 className="font-heading text-sm font-bold text-foreground">
                    Detalle de la entrega · {detailGroup.batch}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailBatch(null)}
                  className="cursor-pointer rounded-lg border border-border bg-background p-1.5 text-muted-foreground hover:bg-muted"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/60">
                      <th className={`px-5 py-2.5 font-semibold ${LABEL}`}>Medicamento</th>
                      <th className={`px-4 py-2.5 font-semibold ${LABEL}`}>Tipo</th>
                      <th className={`px-4 py-2.5 text-right font-semibold ${LABEL}`}>Entregado</th>
                      <th className={`px-4 py-2.5 text-right font-semibold ${LABEL}`}>Faltante</th>
                      <th className={`px-5 py-2.5 font-semibold ${LABEL}`}>Comentario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailGroup.rows.map((r) => (
                      <tr key={r.id} className="border-b border-border">
                        <td className="px-5 py-3 text-sm font-medium text-foreground">
                          {r.medication}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-foreground">
                          {DELIVERY_TYPE_LABEL[r.deliveryType] ?? r.deliveryType}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[13px] text-foreground">
                          {r.quantityDelivered}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[13px] text-foreground">
                          {r.quantityPendingAfter}
                        </td>
                        <td className="px-5 py-3 text-[13px] text-muted-foreground">
                          {r.comment ? r.comment : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {dateModal && (
        <InvoiceDateModal
          initial={dateModal.initial}
          allowNoDate={dateModal.allowNoDate}
          saving={savingDate}
          onConfirm={confirmDate}
          onClose={() => setDateModal(null)}
        />
      )}
    </div>
  )
}
