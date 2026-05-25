import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, AlertCircle, User, AlertTriangle } from 'lucide-react'
import { useStaffMember } from '../hooks/useStaffMember'
import { useUpdateStaff } from '../hooks/useUpdateStaff'
import { StaffStatusBadge } from '../components/StaffStatusBadge'
import { RoleBadge } from '../components/RoleBadge'
import { StaffModuleAssigner } from '../components/StaffModuleAssigner'
import type { UpdateStaffPayload } from '../types/staff.types'
import type { Role } from '../../auth/types/auth.types'

interface EditForm {
  name: string
  email: string
  phone: string
  identificationNumber: string
  role: Role
  isActive: boolean
}

const inputBase = [
  'h-11 w-full rounded-lg border bg-background px-3.5 text-sm',
  'focus:outline-none focus:ring-2 transition-colors',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')

const inputNormal = `${inputBase} border-input hover:border-ring/60 focus:border-primary focus:ring-primary/20`
const inputError  = `${inputBase} border-destructive hover:border-destructive focus:border-destructive focus:ring-destructive/20`

export default function StaffDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: staffMember, isLoading, isError } = useStaffMember(id!)
  const updateMutation = useUpdateStaff(id!)

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<EditForm>()

  useEffect(() => {
    if (staffMember) {
      reset({
        name: staffMember.name,
        email: staffMember.email,
        phone: staffMember.phone ?? '',
        identificationNumber: staffMember.identificationNumber,
        role: staffMember.role,
        isActive: staffMember.isActive,
      })
    }
  }, [staffMember, reset])

  const onSubmit = handleSubmit((data) => {
    const payload: UpdateStaffPayload = {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      identificationNumber: data.identificationNumber,
      role: data.role,
      isActive: data.isActive,
    }
    updateMutation.mutate(payload)
  })

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="rounded-xl border border-border bg-background shadow-sm">
          <div className="px-6 pt-5 pb-5 border-b border-border space-y-4">
            <div className="h-4 w-28 bg-muted rounded" />
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-muted rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-44 bg-muted rounded" />
                  <div className="h-5 w-16 bg-muted rounded-full" />
                  <div className="h-5 w-14 bg-muted rounded-full" />
                </div>
                <div className="h-3.5 w-64 bg-muted rounded" />
              </div>
            </div>
          </div>
          <div className="px-6 py-6 space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-11 bg-muted rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-11 bg-muted rounded-lg" />
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-border bg-muted/20 rounded-b-xl flex justify-end gap-3">
            <div className="h-11 w-24 bg-muted rounded-lg" />
            <div className="h-11 w-36 bg-muted rounded-lg" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-background shadow-sm">
          <div className="px-6 pt-5 pb-4 border-b border-border space-y-2">
            <div className="h-5 w-40 bg-muted rounded" />
            <div className="h-3.5 w-72 bg-muted rounded" />
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-16 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !staffMember) {
    return (
      <div className="rounded-xl border border-border bg-background shadow-sm p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto mb-3">
          <AlertCircle className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-foreground">Personal no encontrado</p>
        <p className="text-xs text-muted-foreground mt-1">El ID proporcionado no corresponde a ningún miembro del personal.</p>
        <button
          onClick={() => navigate('/dashboard/employees')}
          className="mt-4 text-sm text-primary hover:underline cursor-pointer"
        >
          Volver a Personal
        </button>
      </div>
    )
  }

  const initials = staffMember.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

  return (
    <div className="space-y-4">

      {/* Main card */}
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
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">{staffMember.name}</h1>
                <RoleBadge role={staffMember.role} />
                <StaffStatusBadge isActive={staffMember.isActive} />
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 font-mono">
                {staffMember.email} · @{staffMember.username}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} noValidate>
          <div className="px-6 py-6 space-y-5">

            {staffMember.mustChangePassword && (
              <div role="status" className="flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 font-medium">
                  Este miembro del personal debe cambiar su contraseña en el próximo inicio de sesión.
                </p>
              </div>
            )}

            {updateMutation.isError && (
              <div role="alert" className="flex items-start gap-2.5 rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">
                  No se pudieron guardar los cambios. Intenta de nuevo.
                </p>
              </div>
            )}

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="sd-name" className="block text-sm font-medium text-foreground">
                  Nombre completo <span className="text-destructive">*</span>
                </label>
                <input
                  id="sd-name"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'sd-name-error' : undefined}
                  {...register('name', { required: 'El nombre es requerido' })}
                  disabled={updateMutation.isPending}
                  className={errors.name ? inputError : inputNormal}
                />
                {errors.name && (
                  <p id="sd-name-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />{errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="sd-email" className="block text-sm font-medium text-foreground">
                  Correo electrónico <span className="text-destructive">*</span>
                </label>
                <input
                  id="sd-email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'sd-email-error' : undefined}
                  {...register('email', {
                    required: 'El correo es requerido',
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Formato de correo inválido' },
                  })}
                  disabled={updateMutation.isPending}
                  className={errors.email ? inputError : inputNormal}
                />
                {errors.email && (
                  <p id="sd-email-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />{errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* ID + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="sd-idnum" className="block text-sm font-medium text-foreground">
                  Número de identificación <span className="text-destructive">*</span>
                </label>
                <input
                  id="sd-idnum"
                  autoComplete="off"
                  aria-invalid={!!errors.identificationNumber}
                  aria-describedby={errors.identificationNumber ? 'sd-id-error' : undefined}
                  {...register('identificationNumber', { required: 'La identificación es requerida' })}
                  disabled={updateMutation.isPending}
                  className={errors.identificationNumber ? inputError : inputNormal}
                />
                {errors.identificationNumber && (
                  <p id="sd-id-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />{errors.identificationNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="sd-phone" className="block text-sm font-medium text-foreground">
                  Teléfono <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
                </label>
                <input
                  id="sd-phone"
                  type="tel"
                  autoComplete="tel"
                  {...register('phone')}
                  disabled={updateMutation.isPending}
                  placeholder="+573001234567"
                  className={inputNormal}
                />
              </div>
            </div>

            {/* Role + isActive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="sd-role" className="block text-sm font-medium text-foreground">Rol</label>
                <select
                  id="sd-role"
                  {...register('role')}
                  disabled={updateMutation.isPending}
                  className="h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm cursor-pointer
                             hover:border-ring/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <option value="USER">Auxiliar</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    disabled={updateMutation.isPending}
                    className="sr-only peer"
                  />
                  <div className="h-6 w-11 rounded-full bg-muted-foreground/30 transition-colors
                                  peer-checked:bg-primary peer-disabled:opacity-50
                                  after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5
                                  after:rounded-full after:bg-white after:shadow-sm after:transition-transform
                                  after:content-[''] peer-checked:after:translate-x-5" />
                </label>
                <span className="text-sm font-medium text-foreground">Cuenta activa</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20 rounded-b-xl">
            <button
              type="button"
              onClick={() => navigate('/dashboard/employees')}
              disabled={updateMutation.isPending}
              className="h-11 px-5 rounded-lg border border-input text-sm font-medium cursor-pointer
                         hover:bg-muted active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending || !isDirty}
              className="h-11 px-6 rounded-lg bg-primary text-sm font-semibold text-primary-foreground cursor-pointer
                         hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
                         transition-all flex items-center gap-2"
            >
              {updateMutation.isPending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Guardando...
                </>
              ) : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>

      {/* Module assigner card */}
      <div className="rounded-xl border border-border bg-background shadow-sm">
        <div className="px-6 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Módulos asignados</h2>
              <p className="text-xs text-muted-foreground">
                Los cambios se aplican inmediatamente al hacer clic en un módulo.
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-6">
          <StaffModuleAssigner staffMemberId={staffMember.id} assignedModules={staffMember.modules} />
        </div>
      </div>
    </div>
  )
}
