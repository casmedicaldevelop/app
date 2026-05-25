import { useEffect, useState } from 'react'
import { X, AlertCircle, ChevronDown } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { useUpdateModule } from '../hooks/useUpdateModule'
import { IconPicker, renderIcon } from './IconPicker'
import type { SystemModule, UpdateModulePayload } from '../types/modules.types'

const inputBase = [
  'w-full rounded-lg border bg-background px-3.5 text-sm',
  'focus:outline-none focus:ring-2 transition-colors',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')
const inputNormal = `h-11 ${inputBase} border-input hover:border-ring/60 focus:border-primary focus:ring-primary/20`
const inputError  = `h-11 ${inputBase} border-destructive hover:border-destructive focus:border-destructive focus:ring-destructive/20`

interface EditModuleModalProps {
  module: SystemModule | null
  onClose: () => void
}

interface EditForm {
  label: string
  icon: string
  description: string
  isActive: boolean
}

export function EditModuleModal({ module, onClose }: EditModuleModalProps) {
  const mutation = useUpdateModule(module?.id ?? '')
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

  const handleClose = () => {
    reset()
    setIconPickerOpen(false)
    onClose()
  }

  const onSubmit = handleSubmit((data) => {
    const payload: UpdateModulePayload = {
      label: data.label,
      icon: data.icon,
      description: data.description || null,
      isActive: data.isActive,
    }
    mutation.mutate(payload, { onSuccess: handleClose })
  })

  if (!module) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-background shadow-xl border border-border max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background">
          <div>
            <h2 className="text-base font-semibold text-foreground">Editar módulo</h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{module.name}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-6 py-5 space-y-4" noValidate>
          {/* Label */}
          <div className="space-y-1.5">
            <label htmlFor="em-label" className="block text-sm font-medium text-foreground">
              Nombre visible <span className="text-destructive">*</span>
            </label>
            <input
              id="em-label"
              aria-invalid={!!errors.label}
              aria-describedby={errors.label ? 'em-label-err' : undefined}
              {...register('label', { required: 'Requerido' })}
              disabled={mutation.isPending}
              className={errors.label ? inputError : inputNormal}
            />
            {errors.label && (
              <p id="em-label-err" role="alert" className="text-xs text-destructive flex items-center gap-1">
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
            <label htmlFor="em-desc" className="block text-sm font-medium text-foreground">
              Descripción <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
            </label>
            <input
              id="em-desc"
              {...register('description')}
              disabled={mutation.isPending}
              placeholder="Descripción del módulo"
              className={inputNormal}
            />
          </div>

          {/* isActive toggle */}
          <div className="flex items-center gap-3 pt-1">
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

          {/* Assigned users warning */}
          {module.isActive && module.assignedUsersCount > 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-xs text-amber-800">
                Este módulo tiene <strong>{module.assignedUsersCount} personal asignado</strong>.
                Desactivarlo lo ocultará del selector de módulos pero no quitará el acceso existente.
              </p>
            </div>
          )}

          {/* Mutation error */}
          {mutation.isError && (
            <div role="alert" className="flex items-start gap-2.5 rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">No se pudieron guardar los cambios. Intenta de nuevo.</p>
            </div>
          )}

          {/* Actions */}
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
              disabled={mutation.isPending || !isDirty}
              className="h-11 flex-1 rounded-lg bg-primary text-sm font-semibold text-primary-foreground
                         cursor-pointer hover:bg-primary/90 active:scale-[0.98]
                         disabled:opacity-60 disabled:cursor-not-allowed
                         transition-all flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
