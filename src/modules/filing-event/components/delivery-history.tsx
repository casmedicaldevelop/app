import { Fragment, useState } from 'react'
import { ChevronDown, FileText, MessageSquare, Ticket } from 'lucide-react'
import type { DeliveryEventItem, FilingEventDetail, FilingEventItem } from '../services/filing-event.service'
import { useDeliveries } from '../hooks/use-deliveries'
import { useCompany } from '../../company/hooks/useCompany'
import { renderTicket } from '../lib/ticket'
import { openFormatoWindow } from '../lib/formato'
import { filingEventService } from '../services/filing-event.service'

const LABEL = 'text-[11px] uppercase tracking-wider text-muted-foreground'

function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function Row({
  d,
  onTicket,
  onFormato,
}: {
  d: DeliveryEventItem
  onTicket: () => void
  onFormato: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Fragment>
      <tr className="border-b border-border">
        <td className="px-5 py-3 font-mono text-[13px] text-foreground">{fmtDate(d.createdAt)}</td>
        <td className="px-4 py-3 font-mono text-[13px] text-foreground">{fmtTime(d.createdAt)}</td>
        <td className="px-4 py-3 font-mono text-[13px] text-foreground">{d.deliveryNumber}</td>
        <td className="px-4 py-3 text-right font-mono text-[13px] text-foreground">
          {d.quantityDelivered}
        </td>
        <td className="px-4 py-3 text-right">
          {d.quantityPendingAfter > 0 ? (
            <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 font-mono text-[12px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
              {d.quantityPendingAfter}
            </span>
          ) : (
            <span className="font-mono text-[13px] text-foreground">0</span>
          )}
        </td>
        <td className="px-4 py-3 text-center">
          <button
            type="button"
            onClick={onFormato}
            title="Imprimir formato de entrega"
            className="cursor-pointer text-primary hover:opacity-70"
          >
            <FileText className="h-4 w-4" />
          </button>
        </td>
        <td className="px-4 py-3 text-center">
          {d.quantityPendingAfter > 0 ? (
            <button
              type="button"
              onClick={onTicket}
              title="Imprimir / descargar ticket"
              className="cursor-pointer text-primary hover:opacity-70"
            >
              <Ticket className="h-4 w-4" />
            </button>
          ) : (
            <span className="text-muted-foreground/40">—</span>
          )}
        </td>
        <td className="px-4 py-3 text-right">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            title="Ver comentario"
            className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-muted"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </td>
      </tr>
      {open && (
        <tr className="border-b border-border bg-muted/30">
          <td colSpan={8} className="px-5 py-3">
            <div className="flex items-start gap-1.5 text-[13px] text-muted-foreground">
              <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
              {d.comment ? (
                <span className="italic">"{d.comment}"</span>
              ) : (
                <span>Sin comentario.</span>
              )}
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  )
}

/** Tabla de registros de entrega de UNA línea. Se renderiza DENTRO de la sección Entrega. */
export function DeliveryHistory({ item, filing }: { item: FilingEventItem; filing: FilingEventDetail }) {
  const { data, isLoading } = useDeliveries(item.id)
  const { data: company } = useCompany()

  if (isLoading) {
    return <p className="px-4 py-5 text-[13px] text-muted-foreground sm:px-6">Cargando…</p>
  }
  if (!data || data.length === 0) {
    return (
      <p className="px-4 py-5 text-[13px] text-muted-foreground sm:px-6">Sin entregas registradas.</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border bg-muted/60">
            <th className={`px-5 py-2.5 font-semibold ${LABEL}`}>Fecha</th>
            <th className={`px-4 py-2.5 font-semibold ${LABEL}`}>Hora</th>
            <th className={`px-4 py-2.5 font-semibold ${LABEL}`}>Entrega</th>
            <th className={`px-4 py-2.5 text-right font-semibold ${LABEL}`}>Entregado</th>
            <th className={`px-4 py-2.5 text-right font-semibold ${LABEL}`}>Faltante</th>
            <th className={`px-4 py-2.5 text-center font-semibold ${LABEL}`}>Formato</th>
            <th className={`px-4 py-2.5 text-center font-semibold ${LABEL}`}>Ticket</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <Row
              key={d.id}
              d={d}
              onTicket={async () => {
                const w = window.open('', '_blank')
                if (!w) return
                w.document.write('<p style="font:14px sans-serif;padding:16px">Generando ticket…</p>')
                try {
                  const { shelfCode } = await filingEventService.assignShelfCode(filing.id)
                  renderTicket(w, { company, filing, item, delivery: d, shelfCode })
                } catch {
                  w.document.body.innerHTML =
                    '<p style="font:14px sans-serif;padding:16px;color:#b91c1c">No se pudo generar el ticket.</p>'
                }
              }}
              onFormato={() => openFormatoWindow({ company, filing, item, delivery: d })}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
