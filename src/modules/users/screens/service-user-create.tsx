import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCreateServiceUser } from '../hooks/useCreateServiceUser'
import type { CreateServiceUserPayload } from '../types/service-user.types'

interface FormState {
  id: string
  firstName: string
  secondName: string
  firstSurname: string
  secondSurname: string
  phone: string
  email: string
  birthDate: string
  city: string
  neighborhood: string
  address: string
  description: string
}

interface FormErrors {
  id?: string
  firstName?: string
  firstSurname?: string
  phone?: string
  email?: string
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!form.id.trim()) errors.id = 'La cédula es requerida'
  else if (!/^\d+$/.test(form.id.trim())) errors.id = 'La cédula solo debe contener dígitos'
  if (!form.firstName.trim()) errors.firstName = 'El primer nombre es requerido'
  if (!form.firstSurname.trim()) errors.firstSurname = 'El primer apellido es requerido'
  if (!form.phone.trim()) errors.phone = 'El teléfono es requerido'
  else if (!/^\d{10}$/.test(form.phone.trim())) errors.phone = 'El teléfono debe tener exactamente 10 dígitos'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'El correo electrónico no es válido'
  return errors
}

const INITIAL: FormState = {
  id: '', firstName: '', secondName: '', firstSurname: '', secondSurname: '',
  phone: '', email: '', birthDate: '', city: '', neighborhood: '', address: '', description: '',
}

export default function ServiceUserCreatePage() {
  const navigate = useNavigate()
  const create = useCreateServiceUser()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({})

  function handleChange(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    if (touched[field]) {
      const errs = validate({ ...form, [field]: value })
      setErrors((e) => ({ ...e, [field]: errs[field as keyof FormErrors] }))
    }
  }

  function handleBlur(field: keyof FormState) {
    setTouched((t) => ({ ...t, [field]: true }))
    const errs = validate(form)
    setErrors((e) => ({ ...e, [field]: errs[field as keyof FormErrors] }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(form)
    setErrors(errs)
    setTouched({ id: true, firstName: true, firstSurname: true, phone: true, email: true })
    if (Object.keys(errs).length > 0) return

    const payload: CreateServiceUserPayload = {
      id: form.id.trim(),
      firstName: form.firstName.trim(),
      ...(form.secondName.trim() ? { secondName: form.secondName.trim() } : {}),
      firstSurname: form.firstSurname.trim(),
      ...(form.secondSurname.trim() ? { secondSurname: form.secondSurname.trim() } : {}),
      phone: form.phone.trim(),
      ...(form.email ? { email: form.email.trim() } : {}),
      ...(form.birthDate ? { birthDate: form.birthDate } : {}),
      ...(form.city ? { city: form.city.trim() } : {}),
      ...(form.neighborhood ? { neighborhood: form.neighborhood.trim() } : {}),
      ...(form.address ? { address: form.address.trim() } : {}),
      ...(form.description ? { description: form.description.trim() } : {}),
    }

    create.mutate(payload, { onSuccess: () => navigate('/dashboard/usuarios') })
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/dashboard/usuarios')}
          className="h-8 w-8 rounded-lg border border-input flex items-center justify-center cursor-pointer
                     hover:bg-muted transition-colors shrink-0"
          aria-label="Volver"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-foreground">Nuevo usuario</h1>
          <p className="text-xs text-muted-foreground">Complete los datos del usuario del servicio</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="rounded-xl border border-border bg-background shadow-sm divide-y divide-border">

          {/* Datos principales */}
          <div className="px-6 py-5 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Datos principales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cédula */}
              <div className="sm:col-span-2">
                <label htmlFor="su-id" className="block text-xs font-medium text-foreground mb-1">
                  Número de identificación (cédula) <span className="text-destructive">*</span>
                </label>
                <input
                  id="su-id"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={form.id}
                  onChange={(e) => handleChange('id', e.target.value)}
                  onBlur={() => handleBlur('id')}
                  placeholder="Ej: 1234567890"
                  className={`h-9 w-full rounded-lg border px-3 text-sm bg-background
                    focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors
                    ${errors.id ? 'border-destructive focus:border-destructive' : 'border-input focus:border-primary'}`}
                />
                {errors.id && <p className="mt-1 text-xs text-destructive">{errors.id}</p>}
              </div>

              {/* Primer nombre */}
              <div>
                <label htmlFor="su-first-name" className="block text-xs font-medium text-foreground mb-1">
                  Primer nombre <span className="text-destructive">*</span>
                </label>
                <input
                  id="su-first-name"
                  type="text"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  onBlur={() => handleBlur('firstName')}
                  placeholder="Ej: María"
                  className={`h-9 w-full rounded-lg border px-3 text-sm bg-background
                    focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors
                    ${errors.firstName ? 'border-destructive focus:border-destructive' : 'border-input focus:border-primary'}`}
                />
                {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName}</p>}
              </div>

              {/* Segundo nombre */}
              <div>
                <label htmlFor="su-second-name" className="block text-xs font-medium text-foreground mb-1">
                  Segundo nombre
                </label>
                <input
                  id="su-second-name"
                  type="text"
                  autoComplete="additional-name"
                  value={form.secondName}
                  onChange={(e) => handleChange('secondName', e.target.value)}
                  placeholder="Ej: Lucía"
                  className="h-9 w-full rounded-lg border border-input px-3 text-sm bg-background
                             focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>

              {/* Primer apellido */}
              <div>
                <label htmlFor="su-first-surname" className="block text-xs font-medium text-foreground mb-1">
                  Primer apellido <span className="text-destructive">*</span>
                </label>
                <input
                  id="su-first-surname"
                  type="text"
                  autoComplete="family-name"
                  value={form.firstSurname}
                  onChange={(e) => handleChange('firstSurname', e.target.value)}
                  onBlur={() => handleBlur('firstSurname')}
                  placeholder="Ej: García"
                  className={`h-9 w-full rounded-lg border px-3 text-sm bg-background
                    focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors
                    ${errors.firstSurname ? 'border-destructive focus:border-destructive' : 'border-input focus:border-primary'}`}
                />
                {errors.firstSurname && <p className="mt-1 text-xs text-destructive">{errors.firstSurname}</p>}
              </div>

              {/* Segundo apellido */}
              <div>
                <label htmlFor="su-second-surname" className="block text-xs font-medium text-foreground mb-1">
                  Segundo apellido
                </label>
                <input
                  id="su-second-surname"
                  type="text"
                  value={form.secondSurname}
                  onChange={(e) => handleChange('secondSurname', e.target.value)}
                  placeholder="Ej: López"
                  className="h-9 w-full rounded-lg border border-input px-3 text-sm bg-background
                             focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="su-phone" className="block text-xs font-medium text-foreground mb-1">
                  Teléfono <span className="text-destructive">*</span>
                </label>
                <input
                  id="su-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  placeholder="3001234567"
                  className={`h-9 w-full rounded-lg border px-3 text-sm bg-background
                    focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors
                    ${errors.phone ? 'border-destructive focus:border-destructive' : 'border-input focus:border-primary'}`}
                />
                {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="su-email" className="block text-xs font-medium text-foreground mb-1">
                  Correo electrónico
                </label>
                <input
                  id="su-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="correo@ejemplo.com"
                  className={`h-9 w-full rounded-lg border px-3 text-sm bg-background
                    focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors
                    ${errors.email ? 'border-destructive focus:border-destructive' : 'border-input focus:border-primary'}`}
                />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>

              {/* Fecha de nacimiento */}
              <div>
                <label htmlFor="su-birth" className="block text-xs font-medium text-foreground mb-1">
                  Fecha de nacimiento
                </label>
                <input
                  id="su-birth"
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                  className="h-9 w-full rounded-lg border border-input px-3 text-sm bg-background
                             focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="px-6 py-5 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ubicación</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="su-city" className="block text-xs font-medium text-foreground mb-1">Ciudad</label>
                <input
                  id="su-city"
                  type="text"
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Ej: Bogotá"
                  className="h-9 w-full rounded-lg border border-input px-3 text-sm bg-background
                             focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="su-neighborhood" className="block text-xs font-medium text-foreground mb-1">Barrio</label>
                <input
                  id="su-neighborhood"
                  type="text"
                  value={form.neighborhood}
                  onChange={(e) => handleChange('neighborhood', e.target.value)}
                  placeholder="Ej: Chapinero"
                  className="h-9 w-full rounded-lg border border-input px-3 text-sm bg-background
                             focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="su-address" className="block text-xs font-medium text-foreground mb-1">Dirección</label>
                <input
                  id="su-address"
                  type="text"
                  autoComplete="street-address"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Ej: Cra 7 # 45-20"
                  className="h-9 w-full rounded-lg border border-input px-3 text-sm bg-background
                             focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="px-6 py-5 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Información adicional</h2>
            <div>
              <label htmlFor="su-desc" className="block text-xs font-medium text-foreground mb-1">Descripción</label>
              <textarea
                id="su-desc"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Notas adicionales sobre el usuario..."
                rows={3}
                className="w-full rounded-lg border border-input px-3 py-2 text-sm bg-background resize-none
                           focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 bg-muted/10">
            <button
              type="button"
              onClick={() => navigate('/dashboard/usuarios')}
              disabled={create.isPending}
              className="h-8 px-4 rounded-lg border border-input text-xs font-medium cursor-pointer
                         hover:bg-muted disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={create.isPending}
              className="h-8 px-5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold
                         cursor-pointer hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98]
                         transition-all duration-200 shadow-sm"
            >
              {create.isPending ? 'Guardando...' : 'Crear usuario'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
