import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Check, Package, Pill, X } from 'lucide-react'
import { serviceLookup, type ServiceRow } from '../services/service-lookup.service'

const fmtCop = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

/** Una línea elegida: el medicamento/insumo + su cantidad y su prescripción. */
export interface PickedService {
  row: ServiceRow
  serviceType: 'MEDICAMENTO' | 'INSUMO'
  quantity: number
  frequencyPerDay: number
  treatmentDuration: number
  prescribedQuantity: number
  treatmentDays: number
}

interface Fields {
  quantity: string
  frequencyPerDay: string
  treatmentDuration: string
  prescribedQuantity: string
  treatmentDays: string
}
const EMPTY_FIELDS = (quantity: string): Fields => ({
  quantity, // cantidad a entregar (precargada, editable)
  frequencyPerDay: '',
  treatmentDuration: '',
  prescribedQuantity: quantity, // cantidad prescrita (precargada, solo lectura)
  treatmentDays: '',
})
const posInt = (v: string) => /^\d+$/.test(v.trim()) && parseInt(v.trim(), 10) > 0
const fieldsValid = (f: Fields) =>
  posInt(f.quantity) && posInt(f.frequencyPerDay) && posInt(f.treatmentDuration) && posInt(f.prescribedQuantity) && posInt(f.treatmentDays)

const FLABEL = 'mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'
const FINPUT =
  'h-9 w-full rounded-lg border border-input bg-background px-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

/**
 * Modal inferior, ancho completo, para UN servicio del documento (por CUM). Muestra los medicamentos/insumos
 * ACTIVOS con ese CUM y permite elegir uno o varios. Cada uno elegido pide su cantidad (precargada del OCR)
 * y su prescripción; solo se puede confirmar cuando todos los elegidos tienen sus campos completos.
 */
export default function ServicePickerModal({
  cum,
  description,
  defaultQuantity,
  initial,
  onClose,
  onConfirm,
}: {
  cum: string
  description?: string | null
  defaultQuantity: number
  initial: PickedService[]
  onClose: () => void
  onConfirm: (picked: PickedService[]) => void
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<'MEDICAMENTO' | 'INSUMO' | null>(null)
  const [options, setOptions] = useState<ServiceRow[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set(initial.map((p) => p.row.id)))
  const [fields, setFields] = useState<Record<number, Fields>>(() => {
    const init: Record<number, Fields> = {}
    for (const p of initial) {
      init[p.row.id] = {
        quantity: String(p.quantity),
        frequencyPerDay: String(p.frequencyPerDay),
        treatmentDuration: String(p.treatmentDuration),
        prescribedQuantity: String(p.prescribedQuantity),
        treatmentDays: String(p.treatmentDays),
      }
    }
    return init
  })
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    const code = (cum ?? '').trim()
    if (!code) { setOptions([]); setLoading(false); return }
    ;(async () => {
      try {
        const meds = await serviceLookup.med(code)
        if (meds.length) { setSource('MEDICAMENTO'); setOptions(meds); return }
        const ins = await serviceLookup.ins(code)
        if (ins.length) { setSource('INSUMO'); setOptions(ins); return }
        setOptions([])
      } catch {
        setError('No se pudo consultar la base de datos.')
      } finally {
        setLoading(false)
      }
    })()
  }, [cum])

  const toggle = (id: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
        setFields((f) => (f[id] ? f : { ...f, [id]: EMPTY_FIELDS(defaultQuantity ? String(defaultQuantity) : '') }))
      }
      return next
    })

  const setField = (id: number, key: keyof Fields, v: string) =>
    setFields((f) => ({ ...f, [id]: { ...(f[id] ?? EMPTY_FIELDS('')), [key]: v } }))

  const notInContract = !loading && !error && options.length === 0
  const canConfirm =
    !loading && !error && source != null && selectedIds.size > 0 &&
    [...selectedIds].every((id) => fields[id] && fieldsValid(fields[id]))

  const confirm = () => {
    if (!source) return
    const picked: PickedService[] = options
      .filter((o) => selectedIds.has(o.id))
      .map((o) => {
        const f = fields[o.id]
        return {
          row: o,
          serviceType: source,
          quantity: parseInt(f.quantity, 10),
          frequencyPerDay: parseInt(f.frequencyPerDay, 10),
          treatmentDuration: parseInt(f.treatmentDuration, 10),
          prescribedQuantity: parseInt(f.prescribedQuantity, 10),
          treatmentDays: parseInt(f.treatmentDays, 10),
        }
      })
    if (picked.length === 0) return
    onConfirm(picked)
  }

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col border-t border-border bg-background shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">Seleccionar servicio</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              CUM <span className="font-mono text-foreground">{cum || '—'}</span>
              {description ? <span> · {description}</span> : null}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar"
            className="h-7 w-7 shrink-0 rounded-md flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {loading && <p className="text-sm text-muted-foreground">Buscando por CUM…</p>}

          {error && (
            <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/8 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {notInContract && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-900">No está en el contrato vigente</p>
                <p className="mt-1 text-sm text-amber-800">
                  El medicamento o insumo con CUM {cum || '(sin código)'} no está activo en el contrato vigente.
                </p>
              </div>
            </div>
          )}

          {!loading && !error && options.length > 0 && (
            <div className="space-y-2">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {source === 'MEDICAMENTO' ? <Pill className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                Seleccione uno o varios {source === 'MEDICAMENTO' ? 'medicamentos' : 'insumos'}
              </div>
              {options.map((o) => {
                const active = selectedIds.has(o.id)
                const f = fields[o.id]
                return (
                  <div key={o.id} className={`rounded-xl border ${active ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                    <button type="button" onClick={() => toggle(o.id)}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left cursor-pointer">
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-input'}`}>
                        {active && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-foreground">{o.name}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {[o.concentration, o.presentation, o.pharmaceuticalFormRef?.description].filter(Boolean).join(' · ')}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          Unidad: {o.measurementUnitRef?.name ?? o.measurementUnit} · Dispensación: {o.dispensingUnitRef?.description ?? o.dispensingUnit} · Valor: {fmtCop(o.value)}
                        </span>
                      </span>
                    </button>

                    {active && f && (
                      <div className="grid grid-cols-1 gap-3 border-t border-primary/20 px-4 py-3 sm:grid-cols-5">
                        <div>
                          <label className={FLABEL}>Cantidad prescrita <span className="text-rose-500">*</span></label>
                          <input type="number" min={1} inputMode="numeric" value={f.prescribedQuantity}
                            onChange={(e) => setField(o.id, 'prescribedQuantity', e.target.value)} className={FINPUT} />
                        </div>
                        <div>
                          <label className={FLABEL}>Cantidad a entregar <span className="text-rose-500">*</span></label>
                          <input type="number" min={1} inputMode="numeric" value={f.quantity}
                            onChange={(e) => setField(o.id, 'quantity', e.target.value)} className={FINPUT} />
                        </div>
                        <div>
                          <label className={FLABEL}>Frecuencia por día <span className="text-rose-500">*</span></label>
                          <input type="number" min={1} inputMode="numeric" value={f.frequencyPerDay}
                            onChange={(e) => setField(o.id, 'frequencyPerDay', e.target.value)} className={FINPUT} />
                        </div>
                        <div>
                          <label className={FLABEL}>Duración del tratamiento <span className="text-rose-500">*</span></label>
                          <input type="number" min={1} inputMode="numeric" value={f.treatmentDuration}
                            onChange={(e) => setField(o.id, 'treatmentDuration', e.target.value)} className={FINPUT} />
                        </div>
                        <div>
                          <label className={FLABEL}>Días de tratamiento <span className="text-rose-500">*</span></label>
                          <input type="number" min={1} inputMode="numeric" value={f.treatmentDays}
                            onChange={(e) => setField(o.id, 'treatmentDays', e.target.value)} className={FINPUT} />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-border px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose}
            className="h-10 rounded-lg border border-input px-5 text-sm font-medium text-foreground cursor-pointer transition-colors hover:bg-muted">
            Cancelar
          </button>
          <button type="button" onClick={confirm} disabled={!canConfirm}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground cursor-pointer shadow-sm transition-all duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none">
            <Check className="h-4 w-4" /> Confirmar selección
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
