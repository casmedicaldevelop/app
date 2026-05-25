import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Download, Package, X } from 'lucide-react'
import type { CreateDeliveryPayload } from '../types/deliveries.types'
import type { PatientResolution } from '../../../types/shared.types'
import type { RoutingItem } from '../../routings/types/routings.types'

interface NewDeliveryModalProps {
  routings: RoutingItem[]
  patient: PatientResolution | null
  loading: boolean
  onClose: () => void
  onSubmit: (payload: CreateDeliveryPayload) => Promise<boolean>
}

function todayIso(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Devuelve la fecha mínima entre dos ISO `YYYY-MM-DD`. Si una no existe,
 * devuelve la otra. Útil para que el `max` del input de fecha sea simultáneamente
 * "no futura" (hoy) y "no posterior al máximo del direccionamiento".
 */
function minIsoDate(a: string | null | undefined, b: string | null | undefined): string {
  if (!a) return b ?? ''
  if (!b) return a
  return a < b ? a : b
}

export default function NewDeliveryModal({
  routings,
  patient,
  loading,
  onClose,
  onSubmit,
}: NewDeliveryModalProps) {
  const [idInput, setIdInput] = useState('')
  const [direccionamiento, setDireccionamiento] = useState<RoutingItem | null>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)

  // Únicos dos campos editables por el usuario: fecha y cantidad. El resto se
  // deriva del direccionamiento o usa defaults internos (lote='0', EntTotal=1,
  // CausaNoEntrega=0, paciente del direccionamiento).
  const [fecEntrega, setFecEntrega] = useState<string>(todayIso())
  const [cantEntregada, setCantEntregada] = useState<string>('')
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, loading])

  const patientHint = useMemo(() => {
    if (patient?.exists === true) {
      return { tipo: patient.tipoDoc, no: patient.user.id }
    }
    if (patient?.exists === false) {
      return { tipo: patient.fromMipres.tipoDoc, no: patient.fromMipres.noDoc }
    }
    return null
  }, [patient])

  const maxQty = useMemo(() => {
    if (!direccionamiento) return null
    const n = parseInt(direccionamiento.CantTotAEntregar, 10)
    return Number.isFinite(n) && n > 0 ? n : null
  }, [direccionamiento])

  const maxFechaEntrega = useMemo(
    () => minIsoDate(todayIso(), direccionamiento?.FecMaxEnt),
    [direccionamiento],
  )

  const handlePrecargar = () => {
    setSubmitError(null)
    const parsed = parseInt(idInput.trim(), 10)
    if (!parsed || Number.isNaN(parsed)) {
      setLookupError('Ingresá un ID numérico válido')
      setDireccionamiento(null)
      return
    }
    const found = routings.find((r) => r.ID === parsed)
    if (!found) {
      setLookupError('Direccionamiento no encontrado en esta prescripción')
      setDireccionamiento(null)
      return
    }
    setLookupError(null)
    setDireccionamiento(found)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!direccionamiento) {
      setSubmitError('Primero precargá un direccionamiento.')
      return
    }
    if (!fecEntrega) {
      setSubmitError('Ingresá la fecha de entrega.')
      return
    }
    if (fecEntrega > direccionamiento.FecMaxEnt) {
      setSubmitError(
        `La fecha no puede superar la fecha máxima de entrega (${direccionamiento.FecMaxEnt}).`,
      )
      return
    }
    const cantNum = parseInt(cantEntregada.trim(), 10)
    if (!Number.isFinite(cantNum) || cantNum <= 0) {
      setSubmitError('Ingresá una cantidad entregada válida (mayor a 0).')
      return
    }
    if (maxQty != null && cantNum > maxQty) {
      setSubmitError(`La cantidad no puede superar la cantidad a entregar (${maxQty}).`)
      return
    }

    // Datos no editables → del direccionamiento + defaults internos.
    const tipoIdRecibe = patientHint?.tipo ?? direccionamiento.TipoIDPaciente
    const noIdRecibe = patientHint?.no ?? direccionamiento.NoIDPaciente

    const payload: CreateDeliveryPayload = {
      miPresDireccionId: String(direccionamiento.ID),
      codSerTecEntregado: direccionamiento.CodSerTecAEntregar,
      cantTotEntregada: String(cantNum),
      entTotal: 1,
      causaNoEntrega: 0,
      fecEntrega,
      noLote: '0',
      tipoIdRecibe,
      noIdRecibe,
    }
    const ok = await onSubmit(payload)
    if (ok) onClose()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-delivery-title"
      onClick={() => !loading && onClose()}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-xl border border-slate-200 bg-white shadow-2xl sm:max-w-2xl sm:rounded-xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 bg-primary/5 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 id="new-delivery-title" className="text-base font-bold text-slate-900">
                Nueva entrega
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Ingresá el ID del direccionamiento y precargá los datos de esta prescripción.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus:ring-[3px] focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* ID + Precargar */}
          <div className="mb-5">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                ID del direccionamiento <span className="text-rose-500">*</span>
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  value={idInput}
                  onChange={(e) => setIdInput(e.target.value)}
                  placeholder="ej. 847312"
                  disabled={loading}
                  className="h-10 flex-1 rounded-md border-2 border-primary bg-white px-3 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-[3px] focus:ring-primary/25 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
                <button
                  type="button"
                  onClick={handlePrecargar}
                  disabled={loading || !idInput.trim()}
                  className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-primary bg-primary/10 px-3.5 text-[12.5px] font-bold text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  Precargar
                </button>
              </div>
              {lookupError && (
                <p className="mt-1.5 text-[11.5px] font-semibold text-rose-600">{lookupError}</p>
              )}
              {direccionamiento && (
                <p className="mt-1.5 text-[11px] font-semibold text-emerald-700">
                  ✓ Direccionamiento precargado desde el listado de Direccionamientos
                </p>
              )}
            </label>
          </div>

          {/* Datos del direccionamiento (lectura) */}
          {direccionamiento && (
            <div className="mb-5 rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Datos del direccionamiento (autocompletados)
              </p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] sm:grid-cols-4">
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-slate-500">Producto</dt>
                  <dd className="font-mono font-bold text-slate-900">
                    {direccionamiento.CodSerTecAEntregar}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-slate-500">
                    Cant. a entregar
                  </dt>
                  <dd className="font-mono font-bold text-slate-900">
                    {direccionamiento.CantTotAEntregar}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-slate-500">
                    Fec. máx. entrega
                  </dt>
                  <dd className="font-mono font-bold text-slate-900">
                    {direccionamiento.FecMaxEnt}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-slate-500">Paciente</dt>
                  <dd className="font-mono font-bold text-slate-900">
                    {direccionamiento.TipoIDPaciente} {direccionamiento.NoIDPaciente}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Form fields: solo los 2 que el usuario manipula */}
          {direccionamiento && (
            <>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Datos de la entrega
              </p>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Fecha de entrega <span className="text-rose-500">*</span>
                  </span>
                  <input
                    type="date"
                    value={fecEntrega}
                    max={maxFechaEntrega || undefined}
                    onChange={(e) => setFecEntrega(e.target.value)}
                    disabled={loading}
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 font-mono text-sm font-semibold text-slate-900 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                  <span className="text-[10.5px] text-slate-500">
                    Máx. {direccionamiento.FecMaxEnt} (no puede superar la fec. máx. de entrega).
                  </span>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Cant. entregada <span className="text-rose-500">*</span>
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={maxQty ?? undefined}
                    value={cantEntregada}
                    onChange={(e) => setCantEntregada(e.target.value)}
                    placeholder={`máx. ${direccionamiento.CantTotAEntregar}`}
                    disabled={loading}
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 font-mono text-sm font-semibold text-slate-900 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                  <span className="text-[10.5px] text-slate-500">
                    Máx. {direccionamiento.CantTotAEntregar} unidades.
                  </span>
                </label>
              </div>
            </>
          )}

          {submitError && (
            <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] font-semibold text-rose-700">
              {submitError}
            </p>
          )}
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !direccionamiento}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-[3px] focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Registrando…
              </>
            ) : (
              'Registrar entrega'
            )}
          </button>
        </footer>
      </form>
    </div>,
    document.body,
  )
}
