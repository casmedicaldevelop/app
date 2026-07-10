import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Check, X, Hash, CalendarDays } from 'lucide-react'
import { useCreateServiceUser } from '../hooks/useCreateServiceUser'
import type { CreateServiceUserPayload, DocumentType, Gender, HealthcareRegime } from '../types/service-user.types'
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS } from '../../mipres/utils/document-type'
import { UV_CSS } from './user-view.css'

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
  city: string
  neighborhood: string
  address: string
  description: string
}

const EMPTY: FormState = {
  documentType: '', id: '', gender: '', firstName: '', secondName: '', firstSurname: '',
  secondSurname: '', phone: '', email: '', birthMode: 'exact', birthDate: '', age: '',
  healthcareRegime: '', city: '', neighborhood: '', address: '', description: '',
}

function nowYear() {
  return new Date().getFullYear()
}

function validate(f: FormState): Record<string, string> {
  const e: Record<string, string> = {}
  if (!f.documentType) e.documentType = 'Requerido'
  if (!f.id.trim()) e.id = 'Requerido'
  else if (!/^\d+$/.test(f.id.trim())) e.id = 'Solo dígitos'
  if (!f.gender) e.gender = 'Requerido'
  if (!f.firstName.trim()) e.firstName = 'Requerido'
  if (!f.secondName.trim()) e.secondName = 'Requerido'
  if (!f.firstSurname.trim()) e.firstSurname = 'Requerido'
  if (!f.secondSurname.trim()) e.secondSurname = 'Requerido'
  if (!f.phone.trim()) e.phone = 'Requerido'
  else if (!/^\d{10}$/.test(f.phone.trim())) e.phone = 'Debe tener 10 dígitos'
  if (!f.email.trim()) e.email = 'Requerido'
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) e.email = 'Email inválido'
  if (!f.healthcareRegime) e.healthcareRegime = 'Requerido'
  if (!f.city.trim()) e.city = 'Requerido'
  if (!f.neighborhood.trim()) e.neighborhood = 'Requerido'
  if (!f.address.trim()) e.address = 'Requerido'
  if (f.birthMode === 'exact') {
    if (!f.birthDate) e.birth = 'Requerido'
  } else {
    const a = parseInt(f.age, 10)
    if (!f.age || Number.isNaN(a)) e.birth = 'Requerido'
    else if (a < 1 || a > 120) e.birth = 'Edad inválida (1–120)'
  }
  return e
}

export default function ServiceUserCreatePage() {
  const navigate = useNavigate()
  const create = useCreateServiceUser()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggleBirth() {
    setForm((f) => {
      if (f.birthMode === 'exact') {
        let age = f.age
        if (f.birthDate) {
          const y = parseInt(f.birthDate.slice(0, 4), 10)
          if (!Number.isNaN(y)) {
            const d = nowYear() - y
            if (d >= 1 && d <= 120) age = String(d)
          }
        }
        return { ...f, birthMode: 'age', age }
      }
      let birthDate = f.birthDate
      const a = parseInt(f.age, 10)
      if (!Number.isNaN(a)) {
        const ty = nowYear() - a
        const ey = f.birthDate ? parseInt(f.birthDate.slice(0, 4), 10) : NaN
        if (!f.birthDate || Number.isNaN(ey) || ey !== ty) {
          birthDate = `${String(ty).padStart(4, '0')}-01-01`
        }
      }
      return { ...f, birthMode: 'exact', birthDate }
    })
  }

  function save() {
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    let birthDate = ''
    let birthDateApproximate = false
    if (form.birthMode === 'age') {
      const a = parseInt(form.age, 10)
      birthDate = `${String(nowYear() - a).padStart(4, '0')}-01-01`
      birthDateApproximate = true
    } else {
      birthDate = form.birthDate
      birthDateApproximate = false
    }

    const payload: CreateServiceUserPayload = {
      id: form.id.trim(),
      ...(form.documentType ? { documentType: form.documentType } : {}),
      ...(form.gender ? { gender: form.gender } : {}),
      firstName: form.firstName.trim(),
      secondName: form.secondName.trim(),
      firstSurname: form.firstSurname.trim(),
      secondSurname: form.secondSurname.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      birthDate,
      birthDateApproximate,
      ...(form.healthcareRegime ? { healthcareRegime: form.healthcareRegime } : {}),
      city: form.city.trim(),
      neighborhood: form.neighborhood.trim(),
      address: form.address.trim(),
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
    }
    create.mutate(payload, { onSuccess: () => navigate('/dashboard/usuarios') })
  }

  return (
    <div className="uv editing">
      <style>{UV_CSS}</style>

      <header className="topbar">
        <div className="topbar-left">
          <button className="btn-back" type="button" onClick={() => navigate('/dashboard/usuarios')}>
            <ChevronLeft size={14} /> Volver
          </button>
          <h1 className="page-title">Nuevo usuario</h1>
        </div>
        <div className="actions">
          <button className="btn-cancel" type="button" onClick={() => navigate('/dashboard/usuarios')} disabled={create.isPending}>
            <X size={14} /> Cancelar
          </button>
          <button className="btn-edit" type="button" onClick={save} disabled={create.isPending}>
            <Check size={14} /> {create.isPending ? 'Guardando…' : 'Crear usuario'}
          </button>
        </div>
      </header>

      <main className="content">
        <div className="field-grid">
          <div className="field">
            <span className="field-label">Tipo de documento<span className="req">*</span></span>
            <select className="field-input" value={form.documentType} onChange={(e) => set('documentType', e.target.value as FormState['documentType'])}>
              <option value="" disabled>SELECCIONAR...</option>
              {DOCUMENT_TYPES.map((code) => (
                <option key={code} value={code}>{code} — {DOCUMENT_TYPE_LABELS[code]}</option>
              ))}
            </select>
            {errors.documentType && <span className="err">{errors.documentType}</span>}
          </div>
          <div className="field">
            <span className="field-label">Cédula<span className="req">*</span></span>
            <input className="field-input" inputMode="numeric" autoComplete="off" value={form.id} onChange={(e) => set('id', e.target.value)} />
            {errors.id && <span className="err">{errors.id}</span>}
          </div>
          <div className="field">
            <span className="field-label">Primer nombre<span className="req">*</span></span>
            <input className="field-input" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
            {errors.firstName && <span className="err">{errors.firstName}</span>}
          </div>
          <div className="field">
            <span className="field-label">Segundo nombre<span className="req">*</span></span>
            <input className="field-input" value={form.secondName} onChange={(e) => set('secondName', e.target.value)} />
            {errors.secondName && <span className="err">{errors.secondName}</span>}
          </div>
          <div className="field">
            <span className="field-label">Primer apellido<span className="req">*</span></span>
            <input className="field-input" value={form.firstSurname} onChange={(e) => set('firstSurname', e.target.value)} />
            {errors.firstSurname && <span className="err">{errors.firstSurname}</span>}
          </div>
          <div className="field">
            <span className="field-label">Segundo apellido<span className="req">*</span></span>
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
              <button
                type="button"
                className="birth-toggle"
                onClick={toggleBirth}
                title={form.birthMode === 'exact' ? 'Cambiar a edad aproximada' : 'Cambiar a fecha exacta'}
              >
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
            <span className="field-label">Correo<span className="req">*</span></span>
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
            <span className="field-label">Ciudad<span className="req">*</span></span>
            <input className="field-input" value={form.city} onChange={(e) => set('city', e.target.value)} />
            {errors.city && <span className="err">{errors.city}</span>}
          </div>
          <div className="field">
            <span className="field-label">Barrio<span className="req">*</span></span>
            <input className="field-input" value={form.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} />
            {errors.neighborhood && <span className="err">{errors.neighborhood}</span>}
          </div>
          <div className="field">
            <span className="field-label">Dirección<span className="req">*</span></span>
            <input className="field-input" value={form.address} onChange={(e) => set('address', e.target.value)} />
            {errors.address && <span className="err">{errors.address}</span>}
          </div>
          <div className="field field-span">
            <span className="field-label">Descripción</span>
            <textarea className="field-input" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>
        </div>
      </main>
    </div>
  )
}
