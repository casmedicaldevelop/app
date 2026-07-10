import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { CalendarDays, Hash, Pencil, X } from 'lucide-react'
import type {
  DocumentType,
  Gender,
  HealthcareRegime,
  ServiceUser,
  UpdateServiceUserPayload,
} from '../../users/types/service-user.types'
import type { BirthDateMode } from '../types/patient.types'
import { normalizeDocumentType } from '../utils/document-type'

interface EditPatientFormValues {
  documentType: DocumentType | ''
  gender: Gender | ''
  firstName: string
  secondName: string
  firstSurname: string
  secondSurname: string
  phone: string
  email: string
  birthMode: BirthDateMode
  birthDate?: string
  age?: number
  healthcareRegime: HealthcareRegime | ''
  city: string
  neighborhood: string
  address: string
  description: string
}

interface EditPatientModalProps {
  user: ServiceUser
  tipoDoc: string
  onSubmit: (payload: UpdateServiceUserPayload) => Promise<void>
  onClose: () => void
  submitting: boolean
}

function deriveBirthDefaults(user: ServiceUser): {
  mode: BirthDateMode
  birthDate?: string
  age?: number
} {
  if (!user.birthDate) return { mode: 'exact' }
  const isoDate = user.birthDate.slice(0, 10)
  if (user.birthDateApproximate) {
    const year = parseInt(user.birthDate.slice(0, 4), 10)
    if (!Number.isNaN(year)) {
      return { mode: 'age', age: new Date().getFullYear() - year }
    }
  }
  return { mode: 'exact', birthDate: isoDate }
}

export default function EditPatientModal({
  user,
  tipoDoc,
  onSubmit,
  onClose,
  submitting,
}: EditPatientModalProps) {
  const initial = deriveBirthDefaults(user)
  const initialDocumentType: DocumentType | '' =
    user.documentType ?? normalizeDocumentType(tipoDoc) ?? ''

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<EditPatientFormValues>({
    defaultValues: {
      documentType: initialDocumentType,
      gender: (user.gender ?? '') as Gender | '',
      firstName: user.firstName,
      secondName: user.secondName ?? '',
      firstSurname: user.firstSurname,
      secondSurname: user.secondSurname ?? '',
      phone: user.phone,
      email: user.email ?? '',
      birthMode: initial.mode,
      birthDate: initial.birthDate,
      age: initial.age,
      healthcareRegime: (user.healthcareRegime ?? '') as HealthcareRegime | '',
      city: user.city ?? '',
      neighborhood: user.neighborhood ?? '',
      address: user.address ?? '',
      description: user.description ?? '',
    },
  })

  const birthMode: BirthDateMode = watch('birthMode')

  const toggleBirthMode = () => {
    const { birthDate, age } = getValues()
    if (birthMode === 'exact') {
      if (birthDate) {
        const year = parseInt(birthDate.slice(0, 4), 10)
        if (!Number.isNaN(year)) {
          const derived = new Date().getFullYear() - year
          if (derived >= 1 && derived <= 120) setValue('age', derived)
        }
      }
      setValue('birthMode', 'age')
    } else {
      if (age != null && !Number.isNaN(age)) {
        const targetYear = new Date().getFullYear() - age
        const existingYear = birthDate ? parseInt(birthDate.slice(0, 4), 10) : NaN
        if (!birthDate || Number.isNaN(existingYear) || existingYear !== targetYear) {
          setValue('birthDate', `${String(targetYear).padStart(4, '0')}-01-01`)
        }
      }
      setValue('birthMode', 'exact')
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleFormSubmit = async (form: EditPatientFormValues) => {
    let birthDate: string | undefined
    let birthDateApproximate = false
    if (form.birthMode === 'age' && form.age != null && !Number.isNaN(form.age)) {
      const targetYear = new Date().getFullYear() - form.age
      birthDate = `${String(targetYear).padStart(4, '0')}-01-01`
      birthDateApproximate = true
    } else if (form.birthMode === 'exact' && form.birthDate) {
      birthDate = form.birthDate
      birthDateApproximate = false
    }

    const payload: UpdateServiceUserPayload = {
      ...(form.documentType ? { documentType: form.documentType } : {}),
      gender: form.gender || undefined,
      firstName: form.firstName.trim(),
      secondName: form.secondName.trim(),
      firstSurname: form.firstSurname.trim(),
      secondSurname: form.secondSurname.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      birthDate: birthDate ?? null,
      birthDateApproximate,
      healthcareRegime: form.healthcareRegime || undefined,
      city: form.city.trim(),
      neighborhood: form.neighborhood.trim(),
      address: form.address.trim(),
      description: form.description.trim(),
    }
    await onSubmit(payload)
  }

  const inputClass =
    'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm uppercase text-[#2d3436] placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30'
  const inputFixedClass =
    'h-10 w-full rounded-lg border border-slate-300 bg-slate-100 px-3 text-sm font-mono font-bold text-[#2d3436]'

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d3436]/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Editar usuario"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3">
          <div className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-[#2d3436]">Editar usuario</h2>
            <span className="rounded bg-slate-200 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700">
              {tipoDoc} {user.id}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200 hover:text-[#2d3436] focus:outline-none focus:ring-[3px] focus:ring-primary/25"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <Field label="Tipo de documento" required>
                <input
                  type="text"
                  value={initialDocumentType || tipoDoc}
                  readOnly
                  disabled
                  className={inputFixedClass}
                />
                <input type="hidden" {...register('documentType', { required: 'Requerido' })} />
              </Field>
              <Field label="Número de documento" required>
                <input
                  type="text"
                  value={user.id}
                  readOnly
                  disabled
                  className={inputFixedClass}
                />
              </Field>
              <Field label="Primer nombre" required error={errors.firstName?.message}>
                <input {...register('firstName', { required: 'Requerido' })} className={inputClass} autoFocus />
              </Field>
              <Field label="Segundo nombre" required error={errors.secondName?.message}>
                <input {...register('secondName', { required: 'Requerido' })} className={inputClass} />
              </Field>
              <Field label="Primer apellido" required error={errors.firstSurname?.message}>
                <input {...register('firstSurname', { required: 'Requerido' })} className={inputClass} />
              </Field>
              <Field label="Segundo apellido" required error={errors.secondSurname?.message}>
                <input {...register('secondSurname', { required: 'Requerido' })} className={inputClass} />
              </Field>
              <Field label="Género" required error={errors.gender?.message}>
                <select
                  {...register('gender', { required: 'Requerido' })}
                  className="h-10 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-sm text-[#2d3436] transition-colors focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
                >
                  <option value="" disabled>SELECCIONAR...</option>
                  <option value="MASCULINO">MASCULINO</option>
                  <option value="FEMENINO">FEMENINO</option>
                </select>
              </Field>
              <Field label="Teléfono" required error={errors.phone?.message} hint="10 dígitos">
                <input
                  {...register('phone', {
                    required: 'Requerido',
                    pattern: { value: /^\d{10}$/, message: 'Debe tener 10 dígitos' },
                  })}
                  inputMode="tel"
                  maxLength={10}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-[#2d3436] placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field label="Email" required error={errors.email?.message}>
                <input
                  {...register('email', {
                    required: 'Requerido',
                    pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Email inválido' },
                  })}
                  type="email"
                  className={inputClass}
                />
              </Field>
              <Field label="Ciudad" required error={errors.city?.message}>
                <input {...register('city', { required: 'Requerido' })} className={inputClass} />
              </Field>
              <Field label="Barrio" required error={errors.neighborhood?.message}>
                <input {...register('neighborhood', { required: 'Requerido' })} className={inputClass} />
              </Field>
              <Field label="Dirección" required error={errors.address?.message}>
                <input {...register('address', { required: 'Requerido' })} className={inputClass} />
              </Field>
              <Field label="Régimen de salud" required error={errors.healthcareRegime?.message}>
                <select
                  {...register('healthcareRegime', { required: 'Requerido' })}
                  className="h-10 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-sm text-[#2d3436] transition-colors focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
                >
                  <option value="" disabled>SELECCIONAR...</option>
                  <option value="CONTRIBUTIVO">CONTRIBUTIVO</option>
                  <option value="SUBSIDIADO">SUBSIDIADO</option>
                </select>
              </Field>
              <div>
                <label
                  htmlFor="edit-birth-input"
                  className="mb-1.5 block text-[13px] font-semibold text-slate-700"
                >
                  {birthMode === 'exact' ? 'Fecha de nacimiento' : 'Edad aproximada'}
                  <span className="ml-0.5 text-[#ee5253]">*</span>
                </label>
                <div className="relative">
                  <input
                    id="edit-birth-input"
                    type="date"
                    {...register('birthDate', {
                      validate: (v) => {
                        if (getValues('birthMode') !== 'exact') return true
                        return (v && v.length > 0) || 'Requerido'
                      },
                    })}
                    onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                    className={`${birthMode === 'exact' ? '' : 'hidden'} h-10 w-full rounded-lg border border-slate-300 bg-white pl-3 pr-12 text-sm text-[#2d3436] transition-colors focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none`}
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={120}
                    placeholder="Ej. 30"
                    {...register('age', {
                      valueAsNumber: true,
                      validate: (v) => {
                        if (getValues('birthMode') !== 'age') return true
                        if (v == null || Number.isNaN(v)) return 'Requerido'
                        if (!Number.isInteger(v)) return 'Debe ser un número entero'
                        if (v < 1) return 'Edad inválida (mín. 1)'
                        if (v > 120) return 'Edad inválida (máx. 120)'
                        return true
                      },
                    })}
                    className={`${birthMode === 'age' ? '' : 'hidden'} h-10 w-full rounded-lg border border-slate-300 bg-white pl-3 pr-20 text-sm text-[#2d3436] transition-colors focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                  />
                  {birthMode === 'age' && (
                    <span className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
                      años
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={toggleBirthMode}
                    aria-label={birthMode === 'exact' ? 'Cambiar a edad aproximada' : 'Cambiar a fecha exacta'}
                    title={birthMode === 'exact' ? 'Cambiar a edad aproximada' : 'Cambiar a fecha exacta'}
                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors duration-150 hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
                  >
                    {birthMode === 'exact' ? <Hash className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
                  </button>
                </div>
                {birthMode === 'exact' && errors.birthDate && (
                  <span className="mt-1.5 block text-[11.5px] font-medium text-[#ee5253]">
                    {errors.birthDate.message}
                  </span>
                )}
                {birthMode === 'age' && errors.age && (
                  <span className="mt-1.5 block text-[11.5px] font-medium text-[#ee5253]">{errors.age.message}</span>
                )}
              </div>
              <div className="sm:col-span-2">
                <Field label="Descripción" error={errors.description?.message}>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm uppercase text-[#2d3436] placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </Field>
              </div>
            </div>
          </div>

          <footer className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  )
}

function Field({
  label,
  children,
  required,
  error,
  hint,
}: {
  label: string
  children: React.ReactNode
  required?: boolean
  error?: string
  hint?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-[#ee5253]">*</span>}
        {hint && <span className="ml-1.5 text-[11px] font-normal text-slate-400">({hint})</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-[11.5px] font-medium text-[#ee5253]">{error}</span>}
    </label>
  )
}
