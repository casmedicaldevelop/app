import { useRef, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useVerifyOtp } from '../hooks/useVerifyOtp'
import { useResetPassword } from '../hooks/useResetPassword'

// ── Constants ────────────────────────────────────────────────────────────────

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{}|;':",.<>/?])[^\r\n]{8,}$/

const RULES = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Una letra mayúscula (A-Z)', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Una letra minúscula (a-z)', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Un número (0-9)', test: (p: string) => /[0-9]/.test(p) },
  {
    label: 'Un carácter especial',
    test: (p: string) => /[!@#$%^&*()\-_=+\[\]{}|;':",.<>/?]/.test(p),
  },
]

// ── OTP Input ────────────────────────────────────────────────────────────────

interface OtpInputProps {
  onChange: (value: string) => void
  disabled?: boolean
  hasError?: boolean
}

function OtpInput({ onChange, disabled = false, hasError = false }: OtpInputProps) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const refs = useRef<Array<HTMLInputElement | null>>([])

  const commit = (arr: string[]) => {
    onChange(arr.every(Boolean) ? arr.join('') : '')
  }

  const setAt = (idx: number, val: string): string[] => {
    const next = [...digits]
    next[idx] = val
    setDigits(next)
    commit(next)
    return next
  }

  const handleChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const d = e.target.value.replace(/\D/g, '').slice(-1)
    setAt(idx, d)
    if (d && idx < 5) refs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (digits[idx]) {
        setAt(idx, '')
      } else if (idx > 0) {
        setAt(idx - 1, '')
        refs.current[idx - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      refs.current[Math.max(0, idx - 1)]?.focus()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      refs.current[Math.min(5, idx + 1)]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] ?? '')
    setDigits(next)
    commit(next)
    refs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const borderClass = hasError ? 'border-destructive' : 'border-input'

  return (
    <div className="flex justify-between gap-2">
      {digits.map((d, idx) => (
        <input
          key={idx}
          ref={(el) => { refs.current[idx] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          autoComplete={idx === 0 ? 'one-time-code' : 'off'}
          className={`h-12 w-full max-w-[44px] rounded-lg border text-center text-lg font-bold
                      transition-colors caret-transparent select-none
                      focus:outline-none focus:ring-2 focus:ring-primary/20
                      disabled:cursor-not-allowed disabled:opacity-50
                      ${d && !hasError
                        ? 'border-primary bg-primary/5 text-foreground'
                        : `${borderClass} bg-background text-foreground`
                      }`}
        />
      ))}
    </div>
  )
}

// ── Password Rules ───────────────────────────────────────────────────────────

function PasswordRules({ password }: { password: string }) {
  return (
    <ul className="space-y-1 mt-2">
      {RULES.map(({ label, test }) => {
        const met = test(password)
        return (
          <li key={label} className="flex items-center gap-1.5 text-xs">
            {met ? (
              <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-600" />
            ) : (
              <XCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
            <span className={met ? 'text-green-600' : 'text-muted-foreground'}>{label}</span>
          </li>
        )
      })}
    </ul>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

interface PasswordForm {
  newPassword: string
  confirmPassword: string
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const email = searchParams.get('email') ?? ''

  const [verifiedOtp, setVerifiedOtp] = useState('')
  const [blocked, setBlocked] = useState(false)
  const [currentOtp, setCurrentOtp] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const otpVerified = verifiedOtp.length === 6

  const verifyMutation = useVerifyOtp(email)
  const resetMutation = useResetPassword()

  const handleOtpChange = (value: string) => {
    setCurrentOtp(value)
    if (verifyMutation.error) verifyMutation.reset()
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PasswordForm>()

  const newPasswordValue = watch('newPassword') ?? ''
  const confirmPasswordValue = watch('confirmPassword') ?? ''

  const allRulesPass = RULES.every(({ test }) => test(newPasswordValue))
  const passwordsMatch = newPasswordValue === confirmPasswordValue && confirmPasswordValue.length > 0

  if (!email) {
    navigate('/auth/forgot-password', { replace: true })
    return null
  }

  const handleVerify = () => {
    verifyMutation.mutate(currentOtp, {
      onSuccess: () => setVerifiedOtp(currentOtp),
      onError: (err: unknown) => {
        const message = (err as { message?: string })?.message ?? ''
        if (message.includes('max attempts')) setBlocked(true)
      },
    })
  }

  const onSubmit = handleSubmit(({ newPassword }) => {
    resetMutation.mutate(
      { email, otp: verifiedOtp, newPassword },
      {
        onSuccess: () => {
          toast.success('Contraseña actualizada correctamente')
          navigate('/login', { replace: true })
        },
        onError: (err: unknown) => {
          const msg = (err as { message?: string })?.message ?? ''
          setVerifiedOtp('')
          if (msg.includes('max attempts')) {
            setBlocked(true)
            toast.error('Código bloqueado. Solicita uno nuevo.')
          } else {
            toast.error('El código expiró o es inválido. Ingresa el código nuevamente.')
          }
        },
      },
    )
  })

  const errorMessage = verifyMutation.error
    ? (() => {
        const msg = (verifyMutation.error as { message?: string })?.message ?? ''
        return msg.includes('max attempts')
          ? 'Código bloqueado. Solicita uno nuevo.'
          : 'Código incorrecto.'
      })()
    : null

  return (
    <div className="w-full max-w-sm px-6 py-10 sm:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <KeyRound className="h-5 w-5" />
        </div>
        <h1
          className="text-2xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Nueva contraseña
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {otpVerified
            ? 'Crea tu nueva contraseña.'
            : 'Ingresa el código enviado a tu correo electrónico.'}
        </p>
      </div>

      {/* Email hint */}
      <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 px-3.5 py-2.5">
        <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm text-foreground font-medium truncate">{email}</span>
      </div>

      {/* ── Phase 1: OTP Verification ── */}
      {!otpVerified && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Código de verificación
            </label>
            <OtpInput
              onChange={handleOtpChange}
              disabled={verifyMutation.isPending || blocked}
              hasError={!!verifyMutation.error}
            />
            {blocked ? (
              <p className="text-xs text-destructive" role="alert">
                Código bloqueado.{' '}
                <Link to="/auth/forgot-password" className="underline hover:text-destructive/80">
                  Solicitar nuevo código
                </Link>
              </p>
            ) : errorMessage ? (
              <p className="text-xs text-destructive" role="alert">
                {errorMessage}{' '}
                <Link to="/auth/forgot-password" className="underline hover:text-destructive/80">
                  Solicitar nuevo código
                </Link>
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground">6 dígitos · expira en 15 minutos</p>
          </div>

          <button
            type="button"
            onClick={handleVerify}
            disabled={currentOtp.length < 6 || blocked || verifyMutation.isPending}
            className="h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground
                       hover:bg-primary/90 active:scale-[0.98]
                       disabled:cursor-not-allowed disabled:opacity-60
                       focus:outline-none focus:ring-2 focus:ring-primary/40
                       transition-all duration-150 shadow-sm"
          >
            {verifyMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                Verificando...
              </span>
            ) : (
              'Verificar código'
            )}
          </button>
        </div>
      )}

      {/* ── Phase 2: New Password ── */}
      {otpVerified && (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
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
                autoFocus
                placeholder="••••••••"
                {...register('newPassword', {
                  required: 'La contraseña es requerida',
                  pattern: {
                    value: PASSWORD_REGEX,
                    message: 'La contraseña no cumple los requisitos',
                  },
                })}
                disabled={resetMutation.isPending}
                className="h-11 w-full rounded-lg border border-input bg-background px-3.5 pr-10 text-sm text-foreground
                           placeholder:text-muted-foreground/60
                           focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                           disabled:cursor-not-allowed disabled:opacity-50
                           transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showNew ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordRules password={newPasswordValue} />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: 'Confirma tu contraseña',
                  validate: (v) =>
                    v === watch('newPassword') || 'Las contraseñas no coinciden',
                })}
                disabled={resetMutation.isPending}
                className="h-11 w-full rounded-lg border border-input bg-background px-3.5 pr-10 text-sm text-foreground
                           placeholder:text-muted-foreground/60
                           focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                           disabled:cursor-not-allowed disabled:opacity-50
                           transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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
            disabled={!allRulesPass || !passwordsMatch || resetMutation.isPending}
            className="h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground
                       hover:bg-primary/90 active:scale-[0.98]
                       disabled:cursor-not-allowed disabled:opacity-60
                       focus:outline-none focus:ring-2 focus:ring-primary/40
                       transition-all duration-150 shadow-sm"
          >
            {resetMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                Guardando...
              </span>
            ) : (
              'Guardar contraseña'
            )}
          </button>
        </form>
      )}

      <Link
        to="/auth/forgot-password"
        className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver atrás
      </Link>
    </div>
  )
}
