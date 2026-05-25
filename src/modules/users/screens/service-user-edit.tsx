import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { useServiceUser } from '../hooks/useServiceUser'
import { useUpdateServiceUser } from '../hooks/useUpdateServiceUser'
import type { UpdateServiceUserPayload } from '../types/service-user.types'

interface FormState {
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
  isActive: boolean
}

interface FormErrors {
  firstName?: string
  firstSurname?: string
  phone?: string
  email?: string
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!form.firstName.trim()) errors.firstName = 'El primer nombre es requerido'
  if (!form.firstSurname.trim()) errors.firstSurname = 'El primer apellido es requerido'
  if (!form.phone.trim()) errors.phone = 'El teléfono es requerido'
  else if (!/^\d{10}$/.test(form.phone.trim())) errors.phone = 'El teléfono debe tener exactamente 10 dígitos'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'El correo electrónico no es válido'
  return errors
}

export default function ServiceUserEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: user, isLoading, isError } = useServiceUser(id ?? '')
  const update = useUpdateServiceUser(id ?? '')

  const [form, setForm] = useState<FormState>({
    firstName: '', secondName: '', firstSurname: '', secondSurname: '',
    phone: '', email: '', birthDate: '', city: '', neighborhood: '', address: '', description: '', isActive: true,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({})

  useEffect(() => {
    if (!user) return
    setForm({
      firstName: user.firstName,
      secondName: user.secondName ?? '',
      firstSurname: user.firstSurname,
      secondSurname: user.secondSurname ?? '',
      phone: user.phone,
      email: user.email ?? '',
      birthDate: user.birthDate ? user.birthDate.slice(0, 10) : '',
      city: user.city ?? '',
      neighborhood: user.neighborhood ?? '',
      address: user.address ?? '',
      description: user.description ?? '',
      isActive: user.isActive,
    })
  }, [user])

  function handleChange(field: keyof FormState, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }))
    if (touched[field] && typeof value === 'string') {
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
    setTouched({ firstName: true, firstSurname: true, phone: true, email: true })
    if (Object.keys(errs).length > 0) return

    const payload: UpdateServiceUserPayload = {
      firstName: form.firstName.trim(),
      secondName: form.secondName.trim() || null,
      firstSurname: form.firstSurname.trim(),
      secondSurname: form.secondSurname.trim() || null,
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      birthDate: form.birthDate || null,
      city: form.city.trim() || undefined,
      neighborhood: form.neighborhood.trim() || undefined,
      address: form.address.trim() || undefined,
      description: form.description.trim() || undefined,
      isActive: form.isActive,
    }

    update.mutate(payload, { onSuccess: () => navigate('/dashboard/usuarios') })
  }

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
          <div className="h-4 w-40 bg-muted animate-pulse rounded" />
        </div>
        <div className="rounded-xl border border-border bg-background shadow-sm p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              <div className="h-9 w-full bg-muted animate-pulse rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center justify-center py-14 gap-3 text-center rounded-xl border border-border bg-background shadow-sm">
          <AlertCircle className="h-8 w-8 text-destructive/60" />
          <div>
            <p className="text-sm font-medium text-foreground">Usuario no encontrado</p>
            <p className="mt-0.5 text-xs text-muted-foreground">La cédula no corresponde a ningún usuario registrado</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard/usuarios')}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-input text-xs font-medium
                       cursor-pointer hover:bg-muted transition-all duration-150"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a la lista
          </button>
        </div>
      </div>
    )
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
          <h1 className="text-base font-semibold text-foreground">Editar usuario</h1>
          <p className="text-xs text-muted-foreground font-mono">{user.id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="rounded-xl border border-border bg-background shadow-sm divide-y divide-border">

          {/* Cédula (read-only) */}
          <div className="px-6 py-5">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Número de identificación (cédula)
              </label>
              <input
                type="text"
                value={user.id}
                readOnly
                className="h-9 w-full rounded-lg border border-input px-3 text-sm bg-muted/40 text-muted-foreground
                           cursor-not-allowed font-mono"
              />
              <p className="mt-1 text-xs text-muted-foreground">La cédula no se puede modificar</p>
            </div>
          </div>

          {/* Datos principales */}
          <div className="px-6 py-5 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Datos principales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Primer nombre */}
              <div>
                <label htmlFor="su-edit-first-name" className="block text-xs font-medium text-foreground mb-1">
                  Primer nombre <span className="text-destructive">*</span>
                </label>
                <input
                  id="su-edit-first-name"
                  type="text"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  onBlur={() => handleBlur('firstName')}
                  className={`h-9 w-full rounded-lg border px-3 text-sm bg-background
                    focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors
                    ${errors.firstName ? 'border-destructive' : 'border-input focus:border-primary'}`}
                />
                {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName}</p>}
              </div>

              {/* Segundo nombre */}
              <div>
                <label htmlFor="su-edit-second-name" className="block text-xs font-medium text-foreground mb-1">
                  Segundo nombre
                </label>
                <input
                  id="su-edit-second-name"
                  type="text"
                  autoComplete="additional-name"
                  value={form.secondName}
                  onChange={(e) => handleChange('secondName', e.target.value)}
                  className="h-9 w-full rounded-lg border border-input px-3 text-sm bg-background
                             focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>

              {/* Primer apellido */}
              <div>
                <label htmlFor="su-edit-first-surname" className="block text-xs font-medium text-foreground mb-1">
                  Primer apellido <span className="text-destructive">*</span>
                </label>
                <input
                  id="su-edit-first-surname"
                  type="text"
                  autoComplete="family-name"
                  value={form.firstSurname}
                  onChange={(e) => handleChange('firstSurname', e.target.value)}
                  onBlur={() => handleBlur('firstSurname')}
                  className={`h-9 w-full rounded-lg border px-3 text-sm bg-background
                    focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors
                    ${errors.firstSurname ? 'border-destructive' : 'border-input focus:border-primary'}`}
                />
                {errors.firstSurname && <p className="mt-1 text-xs text-destructive">{errors.firstSurname}</p>}
              </div>

              {/* Segundo apellido */}
              <div>
                <label htmlFor="su-edit-second-surname" className="block text-xs font-medium text-foreground mb-1">
                  Segundo apellido
                </label>
                <input
                  id="su-edit-second-surname"
                  type="text"
                  value={form.secondSurname}
                  onChange={(e) => handleChange('secondSurname', e.target.value)}
                  className="h-9 w-full rounded-lg border border-input px-3 text-sm bg-background
                             focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="su-edit-phone" className="block text-xs font-medium text-foreground mb-1">
                  Teléfono <span className="text-destructive">*</span>
                </label>
                <input
                  id="su-edit-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  className={`h-9 w-full rounded-lg border px-3 text-sm bg-background
                    focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors
                    ${errors.phone ? 'border-destructive' : 'border-input focus:border-primary'}`}
                />
                {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="su-edit-email" className="block text-xs font-medium text-foreground mb-1">
                  Correo electrónico
                </label>
                <input
                  id="su-edit-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`h-9 w-full rounded-lg border px-3 text-sm bg-background
                    focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors
                    ${errors.email ? 'border-destructive' : 'border-input focus:border-primary'}`}
                />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>

              {/* Fecha de nacimiento */}
              <div>
                <label htmlFor="su-edit-birth" className="block text-xs font-medium text-foreground mb-1">
                  Fecha de nacimiento
                </label>
                <input
                  id="su-edit-birth"
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
                <label htmlFor="su-edit-city" className="block text-xs font-medium text-foreground mb-1">Ciudad</label>
                <input
                  id="su-edit-city"
                  type="text"
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="h-9 w-full rounded-lg border border-input px-3 text-sm bg-background
                             focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="su-edit-neighborhood" className="block text-xs font-medium text-foreground mb-1">Barrio</label>
                <input
                  id="su-edit-neighborhood"
                  type="text"
                  value={form.neighborhood}
                  onChange={(e) => handleChange('neighborhood', e.target.value)}
                  className="h-9 w-full rounded-lg border border-input px-3 text-sm bg-background
                             focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="su-edit-address" className="block text-xs font-medium text-foreground mb-1">Dirección</label>
                <input
                  id="su-edit-address"
                  type="text"
                  autoComplete="street-address"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="h-9 w-full rounded-lg border border-input px-3 text-sm bg-background
                             focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Descripción + Estado */}
          <div className="px-6 py-5 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Información adicional</h2>
            <div>
              <label htmlFor="su-edit-desc" className="block text-xs font-medium text-foreground mb-1">Descripción</label>
              <textarea
                id="su-edit-desc"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-input px-3 py-2 text-sm bg-background resize-none
                           focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-foreground">Estado</label>
              <label className="relative inline-flex cursor-pointer items-center" aria-label={form.isActive ? 'Activo' : 'Inactivo'}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="h-5 w-9 rounded-full bg-muted-foreground/30 transition-colors duration-200
                                peer-checked:bg-primary
                                after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4
                                after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200
                                after:content-[''] peer-checked:after:translate-x-4" />
              </label>
              <span className={`text-xs font-medium ${form.isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                {form.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 bg-muted/10">
            <button
              type="button"
              onClick={() => navigate('/dashboard/usuarios')}
              disabled={update.isPending}
              className="h-8 px-4 rounded-lg border border-input text-xs font-medium cursor-pointer
                         hover:bg-muted disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={update.isPending}
              className="h-8 px-5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold
                         cursor-pointer hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98]
                         transition-all duration-200 shadow-sm"
            >
              {update.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
