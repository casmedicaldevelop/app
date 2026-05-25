import { useForm } from 'react-hook-form'
import { CalendarDays, Hash, Info, UserCheck, UserPlus } from 'lucide-react'
import type { BirthDateMode, RegisterPatientFormValues } from '../types/patient.types'
import type { MipresFromPrescription } from '../types/shared.types'

interface RegisterPatientFormProps {
  fromMipres: MipresFromPrescription
  onSubmit: (form: RegisterPatientFormValues) => Promise<void>
  onCancel: () => void
  submitting: boolean
}

export default function RegisterPatientForm({
  fromMipres,
  onSubmit,
  onCancel,
  submitting,
}: RegisterPatientFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<RegisterPatientFormValues>({
    defaultValues: {
      address: fromMipres.address,
      birthMode: 'exact',
    },
  })

  const birthMode: BirthDateMode = watch('birthMode')

  // Toggle SYNCS the other representation instead of clearing it.
  // The user keeps whatever they typed; switching modes just shows the equivalent.
  // The submit logic (in useWorkspace.registerPatient) uses form.birthMode to
  // decide which value is authoritative.
  const toggleBirthMode = () => {
    const { birthDate, age } = getValues()
    if (birthMode === 'exact') {
      // exact → age: derive age from birthDate (if any)
      if (birthDate) {
        const year = parseInt(birthDate.slice(0, 4), 10)
        if (!Number.isNaN(year)) {
          const derived = new Date().getFullYear() - year
          if (derived >= 1 && derived <= 120) setValue('age', derived)
        }
      }
      setValue('birthMode', 'age')
    } else {
      // age → exact: derive birthDate from age (if any)
      if (age != null && !Number.isNaN(age)) {
        const targetYear = new Date().getFullYear() - age
        setValue('birthDate', `${String(targetYear).padStart(4, '0')}-01-01`)
      }
      setValue('birthMode', 'exact')
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <UserPlus className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <div className="text-sm font-bold text-slate-900">
              Paciente no registrado en CASMEDICAL
            </div>
            <div className="mt-1 text-xs text-slate-600">
              Datos detectados desde MIPRES:{' '}
              <strong>
                {fromMipres.tipoDoc} {fromMipres.noDoc}
              </strong>{' '}
              · {fromMipres.address}. Completá los datos faltantes para habilitar el resto del workspace.
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Primer nombre" required error={errors.firstName?.message}>
              <input
                {...register('firstName', { required: 'Requerido' })}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm uppercase text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                autoFocus
              />
            </Field>
            <Field label="Segundo nombre">
              <input {...register('secondName')} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm uppercase text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </Field>
            <Field label="Primer apellido" required error={errors.firstSurname?.message}>
              <input
                {...register('firstSurname', { required: 'Requerido' })}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm uppercase text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Field>
            <Field label="Segundo apellido">
              <input {...register('secondSurname')} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm uppercase text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </Field>
            <Field
              label="Teléfono"
              required
              error={errors.phone?.message}
              hint="10 dígitos"
            >
              <input
                {...register('phone', {
                  required: 'Requerido',
                  pattern: {
                    value: /^\d{10}$/,
                    message: 'Debe tener 10 dígitos',
                  },
                })}
                inputMode="tel"
                maxLength={10}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input
                {...register('email', {
                  pattern: {
                    value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                    message: 'Email inválido',
                  },
                })}
                type="email"
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm uppercase text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Field>
            <Field label="Ciudad">
              <input {...register('city')} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm uppercase text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </Field>
            <Field label="Dirección">
              <input {...register('address')} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm uppercase text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </Field>
            <Field label="Régimen de salud" required error={errors.healthcareRegime?.message}>
              <select
                {...register('healthcareRegime', { required: 'Requerido' })}
                defaultValue=""
                className="h-10 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
              >
                <option value="" disabled>SELECCIONAR...</option>
                <option value="CONTRIBUTORY">CONTRIBUTIVO</option>
                <option value="SUBSIDIZED">SUBSIDIADO</option>
              </select>
            </Field>
            <div>
              <label
                htmlFor="birth-input"
                className="mb-1.5 block text-[13px] font-semibold text-slate-700"
              >
                {birthMode === 'exact' ? 'Fecha de nacimiento' : 'Edad aproximada'}
                <span className="ml-1.5 text-[11px] font-normal text-slate-400">opcional</span>
              </label>

              <div className="relative">
                {/* Both inputs are rendered always; hidden one keeps its value
                    so toggling back and forth never loses content. */}
                <input
                  id="birth-input"
                  type="date"
                  {...register('birthDate')}
                  className={`${birthMode === 'exact' ? '' : 'hidden'} h-10 w-full rounded-lg border border-slate-300 bg-white pl-3 pr-12 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none`}
                />
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={120}
                  placeholder="Ej. 30"
                  {...register('age', {
                    valueAsNumber: true,
                    min: { value: 1, message: 'Edad inválida (mín. 1)' },
                    max: { value: 120, message: 'Edad inválida (máx. 120)' },
                    validate: (v) =>
                      v == null ||
                      Number.isNaN(v) ||
                      Number.isInteger(v) ||
                      'Debe ser un número entero',
                  })}
                  className={`${birthMode === 'age' ? '' : 'hidden'} h-10 w-full rounded-lg border border-slate-300 bg-white pl-3 pr-20 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                />

                {birthMode === 'age' && (
                  <span className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
                    años
                  </span>
                )}

                <button
                  type="button"
                  onClick={toggleBirthMode}
                  aria-label={
                    birthMode === 'exact'
                      ? 'Cambiar a edad aproximada'
                      : 'Cambiar a fecha exacta'
                  }
                  title={
                    birthMode === 'exact'
                      ? 'Cambiar a edad aproximada'
                      : 'Cambiar a fecha exacta'
                  }
                  className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors duration-150 hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
                >
                  {birthMode === 'exact' ? (
                    <Hash className="h-4 w-4" />
                  ) : (
                    <CalendarDays className="h-4 w-4" />
                  )}
                </button>
              </div>

              {errors.age && birthMode === 'age' && (
                <span className="mt-1.5 block text-[11.5px] font-medium text-red-600">
                  {errors.age.message}
                </span>
              )}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[12px] text-slate-500">
            <Info className="h-3.5 w-3.5" />
            La cédula <strong className="font-mono text-slate-700">{fromMipres.noDoc}</strong> queda
            asignada al paciente y no se puede editar después.
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserCheck className="h-4 w-4" />
              {submitting ? 'Registrando...' : 'Registrar y continuar'}
            </button>
          </div>
        </form>
      </div>
    </div>
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
        {required && <span className="ml-0.5 text-red-600">*</span>}
        {hint && <span className="ml-1.5 text-[11px] font-normal text-slate-400">({hint})</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-[11.5px] font-medium text-red-600">{error}</span>}
    </label>
  )
}
