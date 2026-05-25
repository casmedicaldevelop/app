import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useLoginForm } from '../hooks/components/useLoginForm'

export default function LoginCard() {
  const { register, onSubmit, errors, isSubmitting } = useLoginForm()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="w-full max-w-sm px-6 py-10 sm:px-8">
      {/* Brand */}
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
          CASMEDICAL
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Sistema de gestión administrativa</p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {/* usernameOrEmail */}
        <div className="space-y-1.5">
          <label
            htmlFor="usernameOrEmail"
            className="block text-sm font-medium text-foreground"
          >
            Usuario o Email
          </label>
          <input
            id="usernameOrEmail"
            type="text"
            autoComplete="username"
            placeholder="usuario o correo@empresa.com"
            {...register('usernameOrEmail', { required: 'Campo requerido' })}
            disabled={isSubmitting}
            className="h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground
                       placeholder:text-muted-foreground/60
                       focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                       disabled:cursor-not-allowed disabled:opacity-50
                       transition-colors"
          />
          {errors.usernameOrEmail && (
            <p className="text-xs text-destructive" role="alert">
              {errors.usernameOrEmail.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground"
          >
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password', { required: 'Campo requerido' })}
              disabled={isSubmitting}
              className="h-11 w-full rounded-lg border border-input bg-background px-3.5 pr-11 text-sm text-foreground
                         placeholder:text-muted-foreground/60
                         focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                         disabled:cursor-not-allowed disabled:opacity-50
                         transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground
                         hover:text-foreground focus:outline-none transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Forgot password */}
        <div className="flex justify-end">
          <Link
            to="/auth/forgot-password"
            className="text-xs text-primary hover:underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground
                     hover:bg-primary/90 active:scale-[0.98]
                     disabled:cursor-not-allowed disabled:opacity-60
                     focus:outline-none focus:ring-2 focus:ring-primary/40
                     transition-all duration-150 shadow-sm"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              Ingresando...
            </span>
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </form>
    </div>
  )
}
