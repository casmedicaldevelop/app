import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Divide,
  Hash,
  ListChecks,
  MessageSquare,
  ReceiptText,
  Truck,
  X,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import type { FilingEventDetail, FilingEventItem } from '../services/filing-event.service'
import { useRegisterDelivery } from '../hooks/use-register-delivery'
import { DeliveryHistory } from './delivery-history'

const LABEL = 'text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'

type DeliveryType = 'COMPLETA' | 'PARCIAL' | 'SIN_EXISTENCIAS'

const OPTIONS: { type: DeliveryType; icon: typeof CheckCircle2; title: string; hint: string }[] = [
  { type: 'COMPLETA', icon: CheckCircle2, title: 'Completa', hint: 'Cierra la radicación con la cantidad entregada.' },
  { type: 'PARCIAL', icon: Divide, title: 'Parcial', hint: 'Digita la cantidad a entregar.' },
  { type: 'SIN_EXISTENCIAS', icon: XCircle, title: 'Sin existencias', hint: 'No entrega. Va a pedidos.' },
]

function StateChip({ tone, text }: { tone: 'emerald' | 'blue' | 'amber'; text: string }) {
  const map = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
  }
  const dot = { emerald: 'bg-emerald-500', blue: 'bg-blue-500', amber: 'bg-amber-500' }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[12px] font-medium ${map[tone]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot[tone]}`} />
      {text}
    </span>
  )
}

export function DeliveryPanel({ item, filing }: { item: FilingEventItem; filing: FilingEventDetail }) {
  const pending = item.quantityPending
  const done = pending <= 0
  // "Sin existencias" solo aplica en la primera entrega (nada entregado aún).
  const hadDelivery = item.quantityDelivered > 0

  const [open, setOpen] = useState(false)
  const [type, setType] = useState<DeliveryType | null>(null)
  const [qty, setQty] = useState('')
  const [comment, setComment] = useState('')

  const mutation = useRegisterDelivery(item.id, filing.id)

  function close() {
    setOpen(false)
    setType(null)
    setQty('')
    setComment('')
  }

  // Resultado calculado para el resumen en vivo (y para validar el submit).
  let delivered: number | null = null
  let qtyError = false
  if (type === 'COMPLETA') {
    // El operador puede entregar el pendiente completo o menos (faltante = no entregado).
    if (qty === '') {
      delivered = pending
    } else {
      const n = parseInt(qty, 10)
      if (Number.isNaN(n) || n < 1 || n > pending) {
        qtyError = true
        delivered = null
      } else {
        delivered = n
      }
    }
  } else if (type === 'SIN_EXISTENCIAS') delivered = 0
  else if (type === 'PARCIAL') {
    const n = parseInt(qty, 10)
    if (qty === '' || Number.isNaN(n) || n < 1 || n >= pending) {
      qtyError = qty !== ''
      delivered = null
    } else {
      delivered = n
    }
  }

  // En COMPLETA, el faltante (pendiente - entregado) se registra como no entregado.
  const unfulfilled = type === 'COMPLETA' && delivered != null ? pending - delivered : 0

  const canSubmit = type != null && delivered != null && !mutation.isPending

  const result =
    type === 'COMPLETA'
      ? { chip: <StateChip tone="emerald" text="Entregado" />, sub: 'Entregado' }
      : type === 'PARCIAL'
        ? { chip: <StateChip tone="blue" text="Entrega parcial" />, sub: 'POR_PEDIR' }
        : type === 'SIN_EXISTENCIAS'
          ? { chip: <StateChip tone="amber" text="Pendiente" />, sub: 'POR_PEDIR' }
          : null

  function submit() {
    if (!canSubmit || type == null) return
    mutation.mutate(
      {
        deliveryType: type,
        quantity: type === 'PARCIAL' || type === 'COMPLETA' ? delivered! : undefined,
        comment: comment.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Entrega registrada')
          close()
        },
        onError: (err) => {
          const msg =
            typeof err === 'object' && err && 'message' in err
              ? String((err as { message: unknown }).message)
              : 'No se pudo registrar la entrega'
          toast.error(msg)
        },
      },
    )
  }

  return (
    <section className="border-b border-border bg-background">
      {/* Encabezado de la sección de entrega + botón que abre el modal inferior */}
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Truck className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-sm font-bold text-foreground">Entrega</h2>
        </div>
        {done ? (
          <span className="text-[13px] text-muted-foreground">Entrega completada</span>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary/90"
          >
            <Truck className="h-4 w-4" />
            Registrar entrega
          </button>
        )}
      </div>

      {/* Registros de entrega (parte de esta sección, no una sección aparte) */}
      <DeliveryHistory item={item} filing={filing} />

      {/* Modal anclado abajo, ancho completo */}
      {open &&
        !done &&
        createPortal(
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={close}
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto border-t border-border bg-background shadow-2xl">
              {/* Header del modal */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-4 py-3.5 sm:px-6">
                <div className="flex items-center gap-2.5">
                  <Truck className="h-4 w-4 text-primary" />
                  <h3 className="font-heading text-sm font-bold text-foreground">
                    Registrar entrega · {item.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="cursor-pointer rounded-lg border border-border bg-background p-1.5 text-muted-foreground hover:bg-muted"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-4 py-5 sm:px-6">
                {/* Tipo de entrega */}
                <div className="mb-5">
                  <div className={`mb-2.5 flex items-center gap-1.5 ${LABEL}`}>
                    <ListChecks className="h-3.5 w-3.5 text-primary" />
                    Tipo de entrega
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {OPTIONS.map((opt) => {
                      const active = type === opt.type
                      const blocked = opt.type === 'SIN_EXISTENCIAS' && hadDelivery
                      return (
                        <button
                          key={opt.type}
                          type="button"
                          disabled={blocked}
                          onClick={() => {
                            if (blocked) return
                            setType(opt.type)
                            if (opt.type !== 'PARCIAL') setQty('')
                          }}
                          className={`rounded-lg border bg-background px-4 py-3 text-left transition-colors ${
                            blocked
                              ? 'cursor-not-allowed border-border opacity-40'
                              : active
                                ? 'cursor-pointer border-primary ring-1 ring-primary'
                                : 'cursor-pointer border-border hover:border-muted-foreground/40'
                          }`}
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <opt.icon className="h-4 w-4 text-primary" />
                            <span className="text-[13px] font-semibold text-foreground">
                              {opt.title}
                            </span>
                          </div>
                          <p className="text-[12px] text-muted-foreground">
                            {blocked ? 'No disponible: ya hubo una entrega.' : opt.hint}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Input cantidad (Parcial y Completa) */}
                {(type === 'PARCIAL' || type === 'COMPLETA') && (
                  <div className="mb-5">
                    <label htmlFor="delivery-qty" className={`mb-2 flex items-center gap-1.5 ${LABEL}`}>
                      <Hash className="h-3.5 w-3.5 text-primary" />
                      Cantidad entregada
                    </label>
                    <input
                      id="delivery-qty"
                      type="number"
                      min={1}
                      max={type === 'COMPLETA' ? pending : pending - 1}
                      step={1}
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      placeholder={
                        type === 'COMPLETA' ? `1 – ${pending} (def. ${pending})` : `1 – ${pending - 1}`
                      }
                      className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 font-mono text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-56"
                    />
                    {qtyError && (
                      <p className="mt-1.5 text-[12px] text-[#ee5253]">
                        Ingresa un valor entre 1 y {type === 'COMPLETA' ? pending : pending - 1}.
                      </p>
                    )}
                  </div>
                )}

                {/* Aviso sin existencias */}
                {type === 'SIN_EXISTENCIAS' && (
                  <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                    <p className="text-[12px] text-amber-800">
                      Las {pending} unidades pasan a pedidos. La radicación sigue en estado Pendiente.
                    </p>
                  </div>
                )}

                {/* Aviso entrega completa con faltante */}
                {type === 'COMPLETA' && unfulfilled > 0 && (
                  <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                    <p className="text-[12px] text-amber-800">
                      El faltante de {unfulfilled} unidad{unfulfilled === 1 ? '' : 'es'} se registra como
                      no entregado (restricción legal) y la radicación se cierra.
                    </p>
                  </div>
                )}

                {/* Resultado en vivo — horizontal, ocupa menos alto */}
                {result && delivered != null && (
                  <div className="mb-5">
                    <div className={`mb-2.5 flex items-center gap-1.5 ${LABEL}`}>
                      <ReceiptText className="h-3.5 w-3.5 text-primary" />
                      Resultado
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-y divide-border border border-border bg-background sm:grid-cols-6 sm:divide-y-0">
                      <div className="px-4 py-2.5">
                        <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Estado</div>
                        {result.chip}
                      </div>
                      <div className="px-4 py-2.5">
                        <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Subestado</div>
                        <span className="font-mono text-[13px]">{result.sub}</span>
                      </div>
                      <div className="px-4 py-2.5">
                        <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">A Entregar</div>
                        <span className="font-mono text-[13px]">{item.quantity}</span>
                      </div>
                      <div className="px-4 py-2.5">
                        <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Entregado</div>
                        <span className="font-mono text-[13px]">{item.quantityDelivered + delivered}</span>
                      </div>
                      <div className="px-4 py-2.5">
                        <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">No entregado</div>
                        <span className="font-mono text-[13px]">
                          {type === 'COMPLETA' ? unfulfilled : 0}
                        </span>
                      </div>
                      <div className="px-4 py-2.5">
                        <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Pendiente</div>
                        <span className="font-mono text-[13px]">
                          {type === 'COMPLETA' ? 0 : pending - delivered}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comentario — siempre al final */}
                <div className="mb-5">
                  <label
                    htmlFor="delivery-comment"
                    className={`mb-2 flex items-center gap-1.5 ${LABEL}`}
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    Comentario de la entrega
                  </label>
                  <textarea
                    id="delivery-comment"
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Comentario de la entrega"
                    className="w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-[13px] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={close}
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
                    {mutation.isPending
                      ? 'Registrando…'
                      : type === 'SIN_EXISTENCIAS'
                        ? 'Marcar Por pedir'
                        : 'Registrar entrega'}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  )
}
