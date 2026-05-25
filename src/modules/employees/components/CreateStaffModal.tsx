import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { X, Copy, Check, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useCreateStaff } from '../hooks/useCreateStaff'
import type { CreateStaffPayload, CreateStaffResponse } from '../types/staff.types'

const inputBase = [
  'h-11 w-full rounded-lg border bg-background px-3.5 text-sm',
  'focus:outline-none focus:ring-2 transition-colors',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')
const inputNormal = `${inputBase} border-input hover:border-ring/60 focus:border-primary focus:ring-primary/20`
const inputError  = `${inputBase} border-destructive hover:border-destructive focus:border-destructive focus:ring-destructive/20`

interface CreateStaffModalProps {
  open: boolean
  onClose: () => void
}

interface CreateStaffForm {
  name: string
  email: string
  username: string
  identificationNumber: string
  phone: string
  role: 'ADMIN' | 'USER'
}

function TempPasswordView({ result, onClose }: { result: CreateStaffResponse; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const [visible, setVisible] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(result.temporaryPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
        <p className="text-sm font-medium text-amber-800 mb-1">⚠ Guarda esta contraseña</p>
        <p className="text-xs text-amber-700">
          Esta es la única vez que se muestra. El personal deberá cambiarla en el primer inicio de sesión.
        </p>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-foreground">Personal creado</p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{result.name}</span> — {result.email}
        </p>
        <p className="text-xs text-muted-foreground">@{result.username}</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Contraseña temporal</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-lg border border-input bg-muted/40 px-3.5 h-11">
            <span className="flex-1 text-sm font-mono tracking-wider">
              {visible ? result.temporaryPassword : '••••••••••••'}
            </span>
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={visible ? 'Ocultar' : 'Mostrar'}
            >
              {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <button
            type="button"
            onClick={copy}
            className="h-11 px-4 rounded-lg border border-input bg-background text-sm font-medium
                       hover:bg-muted transition-colors flex items-center gap-2"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground
                   cursor-pointer hover:bg-primary/90 active:scale-[0.98] transition-all"
      >
        Entendido
      </button>
    </div>
  )
}

export function CreateStaffModal({ open, onClose }: CreateStaffModalProps) {
  const mutation = useCreateStaff()
  const [createdStaff, setCreatedStaff] = useState<CreateStaffResponse | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateStaffForm>({
    defaultValues: { role: 'USER' },
  })

  const handleClose = () => {
    reset()
    setCreatedStaff(null)
    onClose()
  }

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

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-background shadow-xl border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            {createdStaff ? 'Personal creado' : 'Nuevo personal'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          {createdStaff ? (
            <TempPasswordView result={createdStaff} onClose={handleClose} />
          ) : (
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="cs-name" className="block text-sm font-medium text-foreground">
                  Nombre completo <span className="text-destructive">*</span>
                </label>
                <input
                  id="cs-name"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'cs-name-err' : undefined}
                  {...register('name', { required: 'Requerido' })}
                  disabled={mutation.isPending}
                  placeholder="Juan García"
                  className={errors.name ? inputError : inputNormal}
                />
                {errors.name && (
                  <p id="cs-name-err" role="alert" className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />{errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="cs-email" className="block text-sm font-medium text-foreground">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="cs-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'cs-email-err' : undefined}
                    {...register('email', { required: 'Requerido', pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' } })}
                    disabled={mutation.isPending}
                    placeholder="correo@empresa.com"
                    className={errors.email ? inputError : inputNormal}
                  />
                  {errors.email && (
                    <p id="cs-email-err" role="alert" className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />{errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="cs-username" className="block text-sm font-medium text-foreground">
                    Usuario <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="cs-username"
                    autoComplete="username"
                    aria-invalid={!!errors.username}
                    aria-describedby={errors.username ? 'cs-user-err' : undefined}
                    {...register('username', { required: 'Requerido' })}
                    disabled={mutation.isPending}
                    placeholder="jgarcia"
                    className={errors.username ? inputError : inputNormal}
                  />
                  {errors.username && (
                    <p id="cs-user-err" role="alert" className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />{errors.username.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="cs-id" className="block text-sm font-medium text-foreground">
                    Identificación <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="cs-id"
                    autoComplete="off"
                    aria-invalid={!!errors.identificationNumber}
                    aria-describedby={errors.identificationNumber ? 'cs-id-err' : undefined}
                    {...register('identificationNumber', { required: 'Requerido' })}
                    disabled={mutation.isPending}
                    placeholder="12345678"
                    className={errors.identificationNumber ? inputError : inputNormal}
                  />
                  {errors.identificationNumber && (
                    <p id="cs-id-err" role="alert" className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />{errors.identificationNumber.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="cs-phone" className="block text-sm font-medium text-foreground">
                    Teléfono <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
                  </label>
                  <input
                    id="cs-phone"
                    type="tel"
                    autoComplete="tel"
                    {...register('phone')}
                    disabled={mutation.isPending}
                    placeholder="+573001234567"
                    className={inputNormal}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cs-role" className="block text-sm font-medium text-foreground">Rol</label>
                <select
                  id="cs-role"
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

              {mutation.isError && (
                <div role="alert" className="flex items-start gap-2.5 rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">No se pudo crear el personal. Intenta de nuevo.</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={mutation.isPending}
                  className="h-11 flex-1 rounded-lg border border-input text-sm font-medium
                             cursor-pointer hover:bg-muted active:scale-[0.98]
                             disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="h-11 flex-1 rounded-lg bg-primary text-sm font-semibold text-primary-foreground
                             cursor-pointer hover:bg-primary/90 active:scale-[0.98]
                             disabled:opacity-60 disabled:cursor-not-allowed
                             transition-all flex items-center justify-center gap-2"
                >
                  {mutation.isPending ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      Creando...
                    </>
                  ) : (
                    'Crear personal'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
