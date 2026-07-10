import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import DoctorDrawer from '../../doctors/components/doctor-drawer'
import type { Doctor } from '../../doctors/types/doctor.types'
import { UV_CSS } from '../../users/screens/user-view.css'

interface Form {
  frequencyPerDay: string
  treatmentDuration: string
  prescribedQuantity: string
  treatmentDays: string
}
const EMPTY: Form = { frequencyPerDay: '', treatmentDuration: '', prescribedQuantity: '', treatmentDays: '' }
const posInt = (v: string) => /^\d+$/.test(v.trim()) && parseInt(v.trim(), 10) > 0

/** Prescripción de UNA línea. El médico es de la cabecera; cuando `hideDoctor` es true no se pide aquí. */
export interface PrescriptionSubmit {
  doctor: Doctor | null
  frequencyPerDay: number
  treatmentDuration: number
  prescribedQuantity: number
  treatmentDays: number
}

export default function DoctorPrescriptionStepForm({
  onBack,
  onSubmit,
  saving,
  hideDoctor = false,
  submitLabel,
}: {
  onBack: () => void
  onSubmit: (data: PrescriptionSubmit) => void
  saving?: boolean
  hideDoctor?: boolean
  submitLabel?: string
}) {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Form>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const set = <K extends keyof Form>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {}
    if (!hideDoctor && !doctor) e.doctor = 'Seleccione un médico'
    if (!posInt(form.frequencyPerDay)) e.frequencyPerDay = 'Número mayor a 0'
    if (!posInt(form.treatmentDuration)) e.treatmentDuration = 'Número mayor a 0'
    if (!posInt(form.prescribedQuantity)) e.prescribedQuantity = 'Número mayor a 0'
    if (!posInt(form.treatmentDays)) e.treatmentDays = 'Número mayor a 0'
    return e
  }
  const next = () => {
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    if (!hideDoctor && !doctor) return
    onSubmit({
      doctor: hideDoctor ? null : doctor,
      frequencyPerDay: parseInt(form.frequencyPerDay, 10),
      treatmentDuration: parseInt(form.treatmentDuration, 10),
      prescribedQuantity: parseInt(form.prescribedQuantity, 10),
      treatmentDays: parseInt(form.treatmentDays, 10),
    })
  }

  return (
    <div className="uv editing" style={{ background: 'transparent', height: 'auto', minHeight: 0 }}>
      <style>{UV_CSS}</style>
      <div className="field-grid">
        {!hideDoctor && (
          <div className="field field-span">
            <span className="field-label">Médico prescriptor<span className="req">*</span></span>
            <input
              className="field-input"
              readOnly
              value={doctor ? `${doctor.name} — ${doctor.id}` : ''}
              placeholder="Seleccionar o registrar médico…"
              onClick={() => setOpen(true)}
              style={{ cursor: 'pointer' }}
            />
            {errors.doctor && <span className="err">{errors.doctor}</span>}
          </div>
        )}
        <div className="field">
          <span className="field-label">Frecuencia por día<span className="req">*</span></span>
          <input className="field-input" type="number" min={1} inputMode="numeric" value={form.frequencyPerDay} onChange={(e) => set('frequencyPerDay', e.target.value)} />
          {errors.frequencyPerDay && <span className="err">{errors.frequencyPerDay}</span>}
        </div>
        <div className="field">
          <span className="field-label">Duración del tratamiento<span className="req">*</span></span>
          <input className="field-input" type="number" min={1} inputMode="numeric" value={form.treatmentDuration} onChange={(e) => set('treatmentDuration', e.target.value)} />
          {errors.treatmentDuration && <span className="err">{errors.treatmentDuration}</span>}
        </div>
        <div className="field">
          <span className="field-label">Cantidad prescrita<span className="req">*</span></span>
          <input className="field-input" type="number" min={1} inputMode="numeric" value={form.prescribedQuantity} onChange={(e) => set('prescribedQuantity', e.target.value)} />
          {errors.prescribedQuantity && <span className="err">{errors.prescribedQuantity}</span>}
        </div>
        <div className="field">
          <span className="field-label">Días de tratamiento<span className="req">*</span></span>
          <input className="field-input" type="number" min={1} inputMode="numeric" value={form.treatmentDays} onChange={(e) => set('treatmentDays', e.target.value)} />
          {errors.treatmentDays && <span className="err">{errors.treatmentDays}</span>}
        </div>
      </div>

      <div className="flex justify-end gap-3 px-6 py-6">
        <button type="button" onClick={onBack} disabled={saving} className="flex h-11 items-center gap-2 rounded-xl border border-input px-6 text-sm font-medium text-foreground cursor-pointer transition-colors hover:bg-muted disabled:opacity-50">
          <ArrowLeft className="h-4 w-4" /> Atrás
        </button>
        <button type="button" onClick={next} disabled={saving} className="flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground cursor-pointer shadow-sm transition-all duration-200 hover:bg-primary/90 disabled:opacity-60">
          {saving ? 'Guardando…' : (submitLabel ?? 'Guardar')}
        </button>
      </div>

      {!hideDoctor && (
        <DoctorDrawer open={open} onClose={() => setOpen(false)} selected={doctor} onSelect={setDoctor} />
      )}
    </div>
  )
}
