import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, UserPlus, Copy, Check, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useCreateStaff } from '../hooks/useCreateStaff'
import type { CreateStaffPayload, CreateStaffResponse } from '../types/staff.types'

interface CreateStaffForm {
  name: string
  email: string
  username: string
  identificationNumber: string
  phone: string
  role: 'ADMIN' | 'USER'
}

const inputBase = [
  'h-11 w-full rounded-lg border bg-background px-3.5 text-sm',
  'focus:outline-none focus:ring-2 transition-colors',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')

const inputNormal = `${inputBase} border-input hover:border-ring/60 focus:border-primary focus:ring-primary/20`
const inputError  = `${inputBase} border-destructive hover:border-destructive focus:border-destructive focus:ring-destructive/20`

function TempPasswordView({ result, onDone }: { result: CreateStaffResponse; onDone: () => void }) {
  const [copied, setCopied] = useState(false)
  const [visible, setVisible] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(result.temporaryPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-800">Personal creado exitosamente</p>
          <p className="text-xs text-emerald-700 mt-0.5">{result.name} — {result.email}</p>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Guarda esta contraseña ahora</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Esta es la única vez que se muestra. El personal deberá cambiarla en su primer inicio de sesión.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 divide-y divide-border">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuario</span>
          <span className="text-sm font-mono font-semibold text-foreground select-all">@{result.username}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex-1 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contraseña temporal</span>
            <span className="text-sm font-mono tracking-wider select-all">
              {visible ? result.temporaryPassword : '••••••••••••'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded shrink-0"
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={copy}
            className="h-7 px-2.5 rounded-md border border-input bg-background text-xs font-medium cursor-pointer
                       hover:bg-muted active:scale-[0.97] transition-all flex items-center gap-1.5 shrink-0"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onDone}
        className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground cursor-pointer
                   hover:bg-primary/90 active:scale-[0.98] transition-all"
      >
        Entendido, ir a Personal
      </button>
    </div>
  )
}

export default function StaffCreatePage() {
  const navigate = useNavigate()
  const mutation = useCreateStaff()
  const [createdStaff, setCreatedStaff] = useState<CreateStaffResponse | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<CreateStaffForm>({
    defaultValues: { role: 'USER' },
  })

  const onSubmit = handleSubmit((data) => {
    const payload: CreateStaffPayload = {
      name: data.name,
      email: data.email,
      username: data.username,
      identificationNumber: data.identificationNumber,
      ...(data.phone && { phone: data.phone }),
      role: data.role,
    }
    mutation.mutate(payload, {
      onSuccess: (res) => setCreatedStaff(res),
    })
  })

  return (
    <div className="rounded-xl border border-border bg-background shadow-sm">

      {/* Breadcrumb + Header */}
      <div className="px-6 pt-5 pb-5 border-b border-border space-y-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard/employees')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a Personal
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Nuevo personal</h1>
            <p className="text-sm text-muted-foreground">Crea una cuenta de acceso al sistema</p>
          </div>
        </div>
      </div>

      {createdStaff ? (
        <div className="px-6 py-6">
          <TempPasswordView
            result={createdStaff}
            onDone={() => navigate('/dashboard/employees')}
          />
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <div className="px-6 py-6 space-y-5">

            {mutation.isError && (
              <div role="alert" className="flex items-start gap-2.5 rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">
                  No se pudo crear el personal. Verifica los datos e intenta de nuevo.
                </p>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="sc-name" className="block text-sm font-medium text-foreground">
                Nombre completo <span className="text-destructive">*</span>
              </label>
              <input
                id="sc-name"
                autoComplete="name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'sc-name-error' : undefined}
                {...register('name', { required: 'El nombre completo es requerido' })}
                disabled={mutation.isPending}
                placeholder="Juan García"
                className={errors.name ? inputError : inputNormal}
              />
              {errors.name && (
                <p id="sc-name-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.name.message}
                </p>
              )}
            </div>

            {/* Email + Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="sc-email" className="block text-sm font-medium text-foreground">
                  Correo electrónico <span className="text-destructive">*</span>
                </label>
                <input
                  id="sc-email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'sc-email-error' : undefined}
                  {...register('email', {
                    required: 'El correo es requerido',
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Formato de correo inválido' },
                  })}
                  disabled={mutation.isPending}
                  placeholder="correo@empresa.com"
                  className={errors.email ? inputError : inputNormal}
                />
                {errors.email && (
                  <p id="sc-email-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />{errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="sc-username" className="block text-sm font-medium text-foreground">
                  Nombre de usuario <span className="text-destructive">*</span>
                </label>
                <input
                  id="sc-username"
                  autoComplete="username"
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? 'sc-username-error' : undefined}
                  {...register('username', { required: 'El nombre de usuario es requerido' })}
                  disabled={mutation.isPending}
                  placeholder="jgarcia"
                  className={errors.username ? inputError : inputNormal}
                />
                {errors.username && (
                  <p id="sc-username-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />{errors.username.message}
                  </p>
                )}
              </div>
            </div>

            {/* Identification + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="sc-id" className="block text-sm font-medium text-foreground">
                  Número de identificación <span className="text-destructive">*</span>
                </label>
                <input
                  id="sc-id"
                  autoComplete="off"
                  aria-invalid={!!errors.identificationNumber}
                  aria-describedby={errors.identificationNumber ? 'sc-id-error' : undefined}
                  {...register('identificationNumber', { required: 'El número de identificación es requerido' })}
                  disabled={mutation.isPending}
                  placeholder="12345678"
                  className={errors.identificationNumber ? inputError : inputNormal}
                />
                {errors.identificationNumber && (
                  <p id="sc-id-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />{errors.identificationNumber.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="sc-phone" className="block text-sm font-medium text-foreground">
                  Teléfono <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
                </label>
                <input
                  id="sc-phone"
                  type="tel"
                  autoComplete="tel"
                  {...register('phone')}
                  disabled={mutation.isPending}
                  placeholder="+573001234567"
                  className={inputNormal}
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label htmlFor="sc-role" className="block text-sm font-medium text-foreground">Rol</label>
              <select
                id="sc-role"
                {...register('role')}
                disabled={mutation.isPending}
                className="h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm cursor-pointer
                           hover:border-ring/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <option value="USER">Auxiliar</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20 rounded-b-xl">
            <button
              type="button"
              onClick={() => navigate('/dashboard/employees')}
              disabled={mutation.isPending}
              className="h-11 px-5 rounded-lg border border-input text-sm font-medium cursor-pointer
                         hover:bg-muted active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="h-11 px-6 rounded-lg bg-primary text-sm font-semibold text-primary-foreground cursor-pointer
                         hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
                         transition-all flex items-center gap-2"
            >
              {mutation.isPending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Creando...
                </>
              ) : 'Crear personal'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
