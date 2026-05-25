import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, ShieldAlert } from 'lucide-react'
import { useChangePassword } from '../hooks/useChangePassword'

interface ChangePasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ChangePasswordPage() {
  const mutation = useChangePassword()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordForm>()

  const onSubmit = handleSubmit(({ currentPassword, newPassword }) =>
    mutation.mutate({ currentPassword, newPassword }),
  )

  return (
    <div className="w-full max-w-sm px-6 py-10 sm:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
          Cambiar contraseña
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Por seguridad, debes establecer una nueva contraseña antes de continuar.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {/* Current Password */}
        <div className="space-y-1.5">
          <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground">
            Contraseña actual
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              type={showCurrent ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('currentPassword', { required: 'La contraseña actual es requerida' })}
              disabled={mutation.isPending}
              className="h-11 w-full rounded-lg border border-input bg-background px-3.5 pr-11 text-sm text-foreground
                         placeholder:text-muted-foreground/60
                         focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                         disabled:cursor-not-allowed disabled:opacity-50
                         transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              tabIndex={-1}
              aria-label={showCurrent ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-xs text-destructive" role="alert">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label htmlFor="newPassword" className="block text-sm font-medium text-foreground">
            Nueva contraseña
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showNew ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('newPassword', {
                required: 'La nueva contraseña es requerida',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              })}
              disabled={mutation.isPending}
              className="h-11 w-full rounded-lg border border-input bg-background px-3.5 pr-11 text-sm text-foreground
                         placeholder:text-muted-foreground/60
                         focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                         disabled:cursor-not-allowed disabled:opacity-50
                         transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              tabIndex={-1}
              aria-label={showNew ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-xs text-destructive" role="alert">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
            Confirmar nueva contraseña
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: 'Confirma tu contraseña',
                validate: (v) => v === watch('newPassword') || 'Las contraseñas no coinciden',
              })}
              disabled={mutation.isPending}
              className="h-11 w-full rounded-lg border border-input bg-background px-3.5 pr-11 text-sm text-foreground
                         placeholder:text-muted-foreground/60
                         focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                         disabled:cursor-not-allowed disabled:opacity-50
                         transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              tabIndex={-1}
              aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive" role="alert">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground
                     hover:bg-primary/90 active:scale-[0.98]
                     disabled:cursor-not-allowed disabled:opacity-60
                     focus:outline-none focus:ring-2 focus:ring-primary/40
                     transition-all duration-150 shadow-sm"
        >
          {mutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              Guardando...
            </span>
          ) : (
            'Guardar nueva contraseña'
          )}
        </button>
      </form>
    </div>
  )
}
