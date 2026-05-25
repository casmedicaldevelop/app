import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, AlertCircle, ChevronDown } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { useUpdateModule } from '../hooks/useUpdateModule'
import { IconPicker, renderIcon } from '../components/IconPicker'
import { modulesService } from '../services/modules.service'
import type { UpdateModulePayload } from '../types/modules.types'

interface EditForm {
  label: string
  icon: string
  description: string
  isActive: boolean
}

const inputBase = [
  'h-11 w-full rounded-lg border bg-background px-3.5 text-sm',
  'focus:outline-none focus:ring-2 transition-colors',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')

const inputNormal = `${inputBase} border-input hover:border-ring/60 focus:border-primary focus:ring-primary/20`
const inputError  = `${inputBase} border-destructive hover:border-destructive focus:border-destructive focus:ring-destructive/20`

export default function ModuleEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const mutation = useUpdateModule(id ?? '')

  const { data: module, isLoading, isError } = useQuery({
    queryKey: ['modules', id],
    queryFn: () => modulesService.getById(id!),
    enabled: Boolean(id),
  })

  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const { register, handleSubmit, reset, control, watch, formState: { errors, isDirty } } = useForm<EditForm>()

  useEffect(() => {
    if (module) {
      reset({
        label: module.label,
        icon: module.icon,
        description: module.description ?? '',
        isActive: module.isActive,
      })
    }
  }, [module, reset])

  const selectedIcon = watch('icon')

  const onSubmit = handleSubmit((data) => {
    const payload: UpdateModulePayload = {
      label: data.label,
      icon: data.icon,
      description: data.description || null,
      isActive: data.isActive,
    }
    mutation.mutate(payload, {
      onSuccess: () => navigate('/dashboard/modules'),
    })
  })

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-background shadow-sm animate-pulse">
        {/* Header skeleton */}
        <div className="px-6 pt-5 pb-5 border-b border-border space-y-4">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-muted rounded-lg shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-48 bg-muted rounded" />
              <div className="h-3.5 w-32 bg-muted rounded" />
            </div>
            <div className="h-6 w-16 bg-muted rounded-full shrink-0" />
          </div>
        </div>
        {/* Fields skeleton */}
        <div className="px-6 py-6 space-y-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-11 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-border bg-muted/20 rounded-b-xl flex justify-end gap-3">
          <div className="h-11 w-24 bg-muted rounded-lg" />
          <div className="h-11 w-36 bg-muted rounded-lg" />
        </div>
      </div>
    )
  }

  if (isError || !module) {
    return (
      <div className="rounded-xl border border-border bg-background shadow-sm p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto mb-3">
          <AlertCircle className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-foreground">Módulo no encontrado</p>
        <p className="text-xs text-muted-foreground mt-1">El ID proporcionado no corresponde a ningún módulo.</p>
        <button
          onClick={() => navigate('/dashboard/modules')}
          className="mt-4 text-sm text-primary hover:underline cursor-pointer"
        >
          Volver a Módulos
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-background shadow-sm">

      {/* Breadcrumb + Header */}
      <div className="px-6 pt-5 pb-5 border-b border-border space-y-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard/modules')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a Módulos
        </button>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
            ${module.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
          >
            {renderIcon(module.icon, 'h-5 w-5')}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{module.label}</h1>
            <p className="text-sm text-muted-foreground font-mono">{module.name}</p>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold
            ${module.isActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-muted text-muted-foreground border border-border'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${module.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/60'}`} />
            {module.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Warning usuarios asignados */}
      {module.isActive && module.assignedUsersCount > 0 && (
        <div className="px-6 pt-5">
          <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              Este módulo tiene <strong>{module.assignedUsersCount} personal asignado</strong>.
              Desactivarlo lo ocultará del selector de módulos para nuevo personal.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <div className="px-6 py-6 space-y-5">

          {/* Mutation error */}
          {mutation.isError && (
            <div role="alert" className="flex items-start gap-2.5 rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                No se pudieron guardar los cambios. Intenta de nuevo.
              </p>
            </div>
          )}

          {/* Label */}
          <div className="space-y-1.5">
            <label htmlFor="me-label" className="block text-sm font-medium text-foreground">
              Nombre visible <span className="text-destructive">*</span>
            </label>
            <input
              id="me-label"
              autoComplete="off"
              aria-invalid={!!errors.label}
              aria-describedby={errors.label ? 'me-label-error' : undefined}
              {...register('label', { required: 'El nombre visible es requerido' })}
              disabled={mutation.isPending}
              className={errors.label ? inputError : inputNormal}
            />
            {errors.label && (
              <p id="me-label-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{errors.label.message}
              </p>
            )}
          </div>

          {/* Icon picker */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Icono</label>
            <button
              type="button"
              onClick={() => setIconPickerOpen((v) => !v)}
              disabled={mutation.isPending}
              className="flex items-center justify-between w-full h-11 px-3.5 rounded-lg border border-input
                         bg-background hover:border-ring/60 cursor-pointer transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                  {renderIcon(selectedIcon, 'h-4 w-4')}
                </div>
                <span className="text-sm text-muted-foreground font-mono">{selectedIcon}</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-150 ${iconPickerOpen ? 'rotate-180' : ''}`} />
            </button>
            {iconPickerOpen && (
              <Controller
                name="icon"
                control={control}
                render={({ field }) => (
                  <IconPicker
                    value={field.value}
                    onChange={(v) => { field.onChange(v); setIconPickerOpen(false) }}
                  />
                )}
              />
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="me-desc" className="block text-sm font-medium text-foreground">
              Descripción <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
            </label>
            <textarea
              id="me-desc"
              {...register('description')}
              disabled={mutation.isPending}
              rows={3}
              placeholder="Breve descripción del módulo..."
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm
                         hover:border-ring/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors resize-none"
            />
          </div>

          {/* isActive toggle */}
          <div className="flex items-center gap-3 py-1">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                {...register('isActive')}
                disabled={mutation.isPending}
                className="sr-only peer"
              />
              <div className="h-6 w-11 rounded-full bg-muted-foreground/30 transition-colors
                              peer-checked:bg-primary peer-disabled:opacity-50
                              after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5
                              after:rounded-full after:bg-white after:shadow-sm after:transition-transform
                              after:content-[''] peer-checked:after:translate-x-5" />
            </label>
            <span className="text-sm font-medium text-foreground">Módulo activo</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20 rounded-b-xl">
          <button
            type="button"
            onClick={() => navigate('/dashboard/modules')}
            disabled={mutation.isPending}
            className="h-11 px-5 rounded-lg border border-input text-sm font-medium cursor-pointer
                       hover:bg-muted active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={mutation.isPending || !isDirty}
            className="h-11 px-6 rounded-lg bg-primary text-sm font-semibold text-primary-foreground cursor-pointer
                       hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
                       transition-all flex items-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                Guardando...
              </>
            ) : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
