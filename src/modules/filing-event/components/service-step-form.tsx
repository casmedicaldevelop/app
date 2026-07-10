import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, AlertTriangle, Check, Pill, Package } from 'lucide-react'
import { serviceLookup, type ServiceRow } from '../services/service-lookup.service'
import type { OcrData } from './authorization-details'

type Servicio = NonNullable<OcrData['servicios']>[number]

const fmtCop = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

type Source = 'tvmed' | 'tvins'

export default function ServiceStepForm({
  ocr,
  servicio: servicioProp,
  continueLabel,
  onBack,
  onContinue,
}: {
  ocr: OcrData
  /** Servicio puntual del OCR a resolver. Si no se pasa, usa el primero. */
  servicio?: Servicio
  continueLabel?: string
  onBack: () => void
  onContinue: (sel: { service: ServiceRow; serviceType: 'MEDICAMENTO' | 'INSUMO' }) => void
}) {
  const servicio = servicioProp ?? ocr.servicios?.[0]
  const cum = (servicio?.codigo ?? '').trim()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<Source | null>(null)
  const [options, setOptions] = useState<ServiceRow[]>([])
  const [notFound, setNotFound] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    if (!cum) { setNotFound(true); setLoading(false); return }
    ;(async () => {
      try {
        const meds = await serviceLookup.med(cum)
        if (meds.length) { setSource('tvmed'); setOptions(meds); return }
        const ins = await serviceLookup.ins(cum)
        if (ins.length) { setSource('tvins'); setOptions(ins); return }
        setNotFound(true)
      } catch {
        setError('No se pudo consultar la base de datos.')
      } finally {
        setLoading(false)
      }
    })()
  }, [cum])

  const canContinue = !loading && !notFound && !error && selectedId != null

  return (
    <div className="p-6">
      {/* Servicio del documento (referencia) */}
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Servicio del documento</p>
        <p className="mt-1 text-sm text-foreground">
          <span className="font-mono font-medium">{cum || '—'}</span>
          {servicio?.descripcion ? <span> · {servicio.descripcion}</span> : null}
          {servicio?.cantidad != null ? <span className="text-muted-foreground"> · cantidad {servicio.cantidad}</span> : null}
        </p>
      </div>

      {loading && <p className="mt-5 text-sm text-muted-foreground">Buscando servicio por CUM…</p>}

      {error && (
        <div role="alert" className="mt-5 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/8 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {notFound && !loading && (
        <div role="alert" className="mt-5 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-900">El servicio no está disponible en base de datos</p>
            <p className="mt-1 text-sm text-amber-800">
              Valide el servicio: el CUM {cum || '(sin código)'} no se encontró en medicamentos (tvmed_evento) ni en insumos (tvins_evento). No es posible continuar.
            </p>
          </div>
        </div>
      )}

      {!loading && !notFound && !error && options.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {source === 'tvmed' ? <Pill className="h-4 w-4" /> : <Package className="h-4 w-4" />}
            Seleccione el {source === 'tvmed' ? 'medicamento' : 'insumo'}
          </div>
          <div className="space-y-2">
            {options.map((o) => {
              const active = selectedId === o.id
              return (
                <button key={o.id} type="button" onClick={() => setSelectedId(o.id)}
                  className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors cursor-pointer ${
                    active ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/40 hover:bg-muted/40'
                  }`}>
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-input'}`}>
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
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onBack}
          className="flex h-11 items-center gap-2 rounded-xl border border-input px-6 text-sm font-medium text-foreground cursor-pointer transition-colors hover:bg-muted">
          <ArrowLeft className="h-4 w-4" /> Atrás
        </button>
        <button type="button"
          onClick={() => {
            const opt = options.find((o) => o.id === selectedId)
            if (opt && source) onContinue({ service: opt, serviceType: source === 'tvmed' ? 'MEDICAMENTO' : 'INSUMO' })
          }}
          disabled={!canContinue}
          className="flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground cursor-pointer shadow-sm transition-all duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none">
          {continueLabel ?? 'Siguiente'} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
