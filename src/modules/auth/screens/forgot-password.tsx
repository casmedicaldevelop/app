import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import { useForgotPassword } from '../hooks/useForgotPassword'

interface ForgotPasswordForm {
  email: string
}

export default function ForgotPasswordPage() {
  const mutation = useForgotPassword()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>()

  const onSubmit = handleSubmit(({ email }) => mutation.mutate(email))

  return (
    <div className="w-full max-w-sm px-6 py-10 sm:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Mail className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
          Recuperar contraseña
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ingresa tu email y te enviaremos un código de verificación de 6 dígitos.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="correo@empresa.com"
            {...register('email', {
              required: 'El email es requerido',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' },
            })}
            disabled={mutation.isPending}
            className="h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground
                       placeholder:text-muted-foreground/60
                       focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                       disabled:cursor-not-allowed disabled:opacity-50
                       transition-colors"
          />
          {errors.email && (
            <p className="text-xs text-destructive" role="alert">
              {errors.email.message}
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
              Enviando...
            </span>
          ) : (
            'Enviar código'
          )}
        </button>
      </form>

      <Link
        to="/login"
        className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al login
      </Link>
    </div>
  )
}
