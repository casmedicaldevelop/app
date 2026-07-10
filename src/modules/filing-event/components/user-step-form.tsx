import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Hash, CalendarDays, AlertCircle } from 'lucide-react'
import { serviceUsersService } from '../../users/services/service-users.service'
import type {
  CreateServiceUserPayload,
  DocumentType,
  Gender,
  HealthcareRegime,
  ServiceUser,
  UpdateServiceUserPayload,
} from '../../users/types/service-user.types'
import { DOCUMENT_TYPE_LABELS, normalizeDocumentType } from '../../mipres/utils/document-type'
import { UV_CSS } from '../../users/screens/user-view.css'
import type { OcrData } from './authorization-details'

type BirthMode = 'exact' | 'age'

interface FormState {
  documentType: '' | DocumentType
  id: string
  gender: '' | Gender
  firstName: string
  secondName: string
  firstSurname: string
  secondSurname: string
  phone: string
  email: string
  birthMode: BirthMode
  birthDate: string
  age: string
  healthcareRegime: '' | HealthcareRegime
  department: string
  city: string
  neighborhood: string
  address: string
  description: string
}

const EMPTY: FormState = {
  documentType: '', id: '', gender: '', firstName: '', secondName: '', firstSurname: '',
  secondSurname: '', phone: '', email: '', birthMode: 'exact', birthDate: '', age: '',
  healthcareRegime: '', department: '', city: '', neighborhood: '', address: '', description: '',
}

const nowYear = () => new Date().getFullYear()
const digits = (s?: string | null) => (s ?? '').replace(/\D/g, '')

/** Celular preferente (10 dígitos); si no, teléfono; si no, lo que haya. */
function pickPhone(celular?: string | null, telefono?: string | null): string {
  const c = digits(celular)
  const t = digits(telefono)
  if (c.length === 10) return c
  if (t.length === 10) return t
  return c || t
}

/** Deriva modo/fecha/edad desde los datos guardados (igual que mipres). */
function deriveBirth(birthDate: string | null, approximate: boolean): Pick<FormState, 'birthMode' | 'birthDate' | 'age'> {
  if (!birthDate) return { birthMode: 'exact', birthDate: '', age: '' }
  const iso = birthDate.slice(0, 10)
  const year = parseInt(iso.slice(0, 4), 10)
  if (approximate && !Number.isNaN(year)) {
    const a = nowYear() - year
    return { birthMode: 'age', birthDate: iso, age: a >= 1 && a <= 120 ? String(a) : '' }
  }
  return { birthMode: 'exact', birthDate: iso, age: '' }
}

function fromUser(u: ServiceUser): FormState {
  return {
    documentType: u.documentType ?? '',
    id: u.id,
    gender: u.gender ?? '',
    firstName: u.firstName ?? '',
    secondName: u.secondName ?? '',
    firstSurname: u.firstSurname ?? '',
    secondSurname: u.secondSurname ?? '',
    phone: u.phone ?? '',
    email: u.email ?? '',
    ...deriveBirth(u.birthDate, u.birthDateApproximate),
    healthcareRegime: '', // el régimen no se precarga: el operador lo elige siempre
    department: u.department ?? '',
    city: u.city ?? '',
    neighborhood: u.neighborhood ?? '',
    address: u.address ?? '',
    description: u.description ?? '',
  }
}

function fromOcr(ocr: OcrData): FormState {
  const a = ocr.afiliado ?? {}
  return {
    ...EMPTY,
    documentType: normalizeDocumentType(a.tipo_documento) ?? '',
    id: digits(a.numero_documento),
    firstName: (a.primer_nombre ?? '').toUpperCase(),
    secondName: (a.segundo_nombre ?? '').toUpperCase(),
    firstSurname: (a.primer_apellido ?? '').toUpperCase(),
    secondSurname: (a.segundo_apellido ?? '').toUpperCase(),
    phone: pickPhone(a.celular, a.telefono),
    email: (a.correo ?? '').toUpperCase(),
    birthMode: 'exact',
    birthDate: (a.fecha_nacimiento ?? '').slice(0, 10),
    department: (a.departamento ?? '').toUpperCase(),
    city: (a.municipio ?? '').toUpperCase(),
    address: (a.direccion_residencia ?? '').toUpperCase(),
  }
}

function validate(f: FormState): Record<string, string> {
  const e: Record<string, string> = {}
  if (!f.gender) e.gender = 'Requerido'
  if (!f.firstName.trim()) e.firstName = 'Requerido'
  if (!f.firstSurname.trim()) e.firstSurname = 'Requerido'
  if (!f.phone.trim()) e.phone = 'Requerido'
  else if (!/^\d{10}$/.test(f.phone.trim())) e.phone = 'Debe tener 10 dígitos'
  // Correo opcional: solo se valida el formato si viene diligenciado.
  if (f.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) e.email = 'Email inválido'
  if (!f.healthcareRegime) e.healthcareRegime = 'Requerido'
  // Departamento, ciudad, barrio y dirección son opcionales.
  if (f.birthMode === 'exact') {
    if (!f.birthDate) e.birth = 'Requerido'
  } else {
    const a = parseInt(f.age, 10)
    if (!f.age || Number.isNaN(a)) e.birth = 'Requerido'
    else if (a < 1 || a > 120) e.birth = 'Edad inválida (1–120)'
  }
  return e
}

export default function UserStepForm({ ocr, onBack, onSaved }: { ocr: OcrData; onBack: () => void; onSaved: (regime: HealthcareRegime | null) => void }) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [exists, setExists] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    const doc = digits(ocr.afiliado?.numero_documento)
    if (!doc) { setForm(fromOcr(ocr)); setLoading(false); return }
    serviceUsersService.getById(doc)
      .then((u) => { setForm(fromUser(u)); setExists(true) })
      .catch(() => { setForm(fromOcr(ocr)); setExists(false) })
      .finally(() => setLoading(false))
  }, [ocr])

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggleBirth() {
    setForm((f) => {
      if (f.birthMode === 'exact') {
        let age = f.age
        if (f.birthDate) {
          const y = parseInt(f.birthDate.slice(0, 4), 10)
          if (!Number.isNaN(y)) { const d = nowYear() - y; if (d >= 1 && d <= 120) age = String(d) }
        }
        return { ...f, birthMode: 'age', age }
      }
      let birthDate = f.birthDate
      const a = parseInt(f.age, 10)
      if (!Number.isNaN(a)) {
        const ty = nowYear() - a
        const ey = f.birthDate ? parseInt(f.birthDate.slice(0, 4), 10) : NaN
        if (!f.birthDate || Number.isNaN(ey) || ey !== ty) birthDate = `${String(ty).padStart(4, '0')}-01-01`
      }
      return { ...f, birthMode: 'exact', birthDate }
    })
  }

  async function next() {
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    let birthDate = form.birthDate
    let birthDateApproximate = false
    if (form.birthMode === 'age') {
      birthDate = `${String(nowYear() - parseInt(form.age, 10)).padStart(4, '0')}-01-01`
      birthDateApproximate = true
    }

    setSaving(true)
    setSaveError(null)
    try {
      if (exists) {
        const payload: UpdateServiceUserPayload = {
          documentType: form.documentType || undefined,
          gender: form.gender || null,
          firstName: form.firstName.trim(),
          secondName: form.secondName.trim(),
          firstSurname: form.firstSurname.trim(),
          secondSurname: form.secondSurname.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          birthDate,
          birthDateApproximate,
          healthcareRegime: form.healthcareRegime || null,
          department: form.department.trim() || undefined,
          city: form.city.trim() || undefined,
          neighborhood: form.neighborhood.trim() || undefined,
          address: form.address.trim() || undefined,
          description: form.description.trim() || undefined,
        }
        await serviceUsersService.update(form.id, payload)
      } else {
        const payload: CreateServiceUserPayload = {
          id: form.id.trim(),
          ...(form.documentType ? { documentType: form.documentType } : {}),
          ...(form.gender ? { gender: form.gender } : {}),
          firstName: form.firstName.trim(),
          secondName: form.secondName.trim(),
          firstSurname: form.firstSurname.trim(),
          secondSurname: form.secondSurname.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          birthDate,
          birthDateApproximate,
          ...(form.healthcareRegime ? { healthcareRegime: form.healthcareRegime } : {}),
          department: form.department.trim() || undefined,
          city: form.city.trim() || undefined,
          neighborhood: form.neighborhood.trim() || undefined,
          address: form.address.trim() || undefined,
          ...(form.description.trim() ? { description: form.description.trim() } : {}),
        }
        await serviceUsersService.create(payload)
      }
      onSaved(form.healthcareRegime || null)
    } catch (err) {
      setSaveError((err as { message?: string })?.message ?? 'No se pudo guardar el usuario.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Validando usuario por documento…</div>
  }

  return (
    <div className="uv editing" style={{ background: 'transparent', height: 'auto', minHeight: 0 }}>
      <style>{UV_CSS}</style>
      <p className="px-6 pt-4 pb-1 text-xs text-muted-foreground">
        {exists ? 'Usuario existente: revise y actualice sus datos.' : 'Usuario nuevo: complete los datos para crearlo.'}
      </p>
      <div className="field-grid">
          <div className="field">
            <span className="field-label">Tipo de documento</span>
            <input className="field-input" value={form.documentType ? `${form.documentType} — ${DOCUMENT_TYPE_LABELS[form.documentType]}` : '—'} readOnly disabled />
          </div>
          <div className="field">
            <span className="field-label">Cédula</span>
            <input className="field-input" value={form.id} readOnly disabled />
          </div>
          <div className="field">
            <span className="field-label">Primer nombre<span className="req">*</span></span>
            <input className="field-input" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
            {errors.firstName && <span className="err">{errors.firstName}</span>}
          </div>
          <div className="field">
            <span className="field-label">Segundo nombre</span>
            <input className="field-input" value={form.secondName} onChange={(e) => set('secondName', e.target.value)} />
            {errors.secondName && <span className="err">{errors.secondName}</span>}
          </div>
          <div className="field">
            <span className="field-label">Primer apellido<span className="req">*</span></span>
            <input className="field-input" value={form.firstSurname} onChange={(e) => set('firstSurname', e.target.value)} />
            {errors.firstSurname && <span className="err">{errors.firstSurname}</span>}
          </div>
          <div className="field">
            <span className="field-label">Segundo apellido</span>
            <input className="field-input" value={form.secondSurname} onChange={(e) => set('secondSurname', e.target.value)} />
            {errors.secondSurname && <span className="err">{errors.secondSurname}</span>}
          </div>
          <div className="field">
            <span className="field-label">Género<span className="req">*</span></span>
            <select className="field-input" value={form.gender} onChange={(e) => set('gender', e.target.value as FormState['gender'])}>
              <option value="" disabled>SELECCIONAR...</option>
              <option value="MASCULINO">MASCULINO</option>
              <option value="FEMENINO">FEMENINO</option>
            </select>
            {errors.gender && <span className="err">{errors.gender}</span>}
          </div>
          <div className="field">
            <span className="field-label">{form.birthMode === 'age' ? 'Edad aproximada' : 'Fecha de nacimiento'}<span className="req">*</span></span>
            <div className="birth-row">
              {form.birthMode === 'exact' ? (
                <input className="field-input" type="date" value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
              ) : (
                <input className="field-input" type="number" min={1} max={120} placeholder="Ej. 30" value={form.age} onChange={(e) => set('age', e.target.value)} />
              )}
              <button type="button" className="birth-toggle" onClick={toggleBirth}
                title={form.birthMode === 'exact' ? 'Cambiar a edad aproximada' : 'Cambiar a fecha exacta'}>
                {form.birthMode === 'exact' ? <Hash size={14} /> : <CalendarDays size={14} />}
              </button>
            </div>
            {errors.birth && <span className="err">{errors.birth}</span>}
          </div>
          <div className="field">
            <span className="field-label">Teléfono<span className="req">*</span></span>
            <input className="field-input" type="tel" inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            {errors.phone && <span className="err">{errors.phone}</span>}
          </div>
          <div className="field">
            <span className="field-label">Correo</span>
            <input className="field-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
            {errors.email && <span className="err">{errors.email}</span>}
          </div>
          <div className="field">
            <span className="field-label">Régimen<span className="req">*</span></span>
            <select className="field-input" value={form.healthcareRegime} onChange={(e) => set('healthcareRegime', e.target.value as FormState['healthcareRegime'])}>
              <option value="" disabled>SELECCIONAR...</option>
              <option value="CONTRIBUTIVO">CONTRIBUTIVO</option>
              <option value="SUBSIDIADO">SUBSIDIADO</option>
            </select>
            {errors.healthcareRegime && <span className="err">{errors.healthcareRegime}</span>}
          </div>
          <div className="field">
            <span className="field-label">Departamento</span>
            <input className="field-input" value={form.department} onChange={(e) => set('department', e.target.value)} />
            {errors.department && <span className="err">{errors.department}</span>}
          </div>
          <div className="field">
            <span className="field-label">Ciudad</span>
            <input className="field-input" value={form.city} onChange={(e) => set('city', e.target.value)} />
            {errors.city && <span className="err">{errors.city}</span>}
          </div>
          <div className="field">
            <span className="field-label">Barrio</span>
            <input className="field-input" value={form.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} />
            {errors.neighborhood && <span className="err">{errors.neighborhood}</span>}
          </div>
          <div className="field">
            <span className="field-label">Dirección</span>
            <input className="field-input" value={form.address} onChange={(e) => set('address', e.target.value)} />
            {errors.address && <span className="err">{errors.address}</span>}
          </div>
          <div className="field field-span">
            <span className="field-label">Descripción</span>
            <textarea className="field-input" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>
        </div>

      {saveError && (
        <div role="alert" className="mx-6 mt-4 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/8 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{saveError}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 px-6 py-6">
        <button type="button" onClick={onBack} disabled={saving}
          className="flex h-11 items-center gap-2 rounded-xl border border-input px-6 text-sm font-medium text-foreground cursor-pointer transition-colors hover:bg-muted disabled:opacity-50">
          <ArrowLeft className="h-4 w-4" /> Atrás
        </button>
        <button type="button" onClick={next} disabled={saving}
          className="flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground cursor-pointer shadow-sm transition-all duration-200 hover:bg-primary/90 disabled:opacity-50">
          {saving ? 'Guardando…' : 'Siguiente'} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
