import { useState } from 'react'
import { X, AlertCircle, ChevronDown } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { useCreateModule } from '../hooks/useCreateModule'
import { IconPicker, renderIcon } from './IconPicker'
import type { CreateModulePayload } from '../types/modules.types'

const inputBase = [
  'w-full rounded-lg border bg-background px-3.5 text-sm',
  'focus:outline-none focus:ring-2 transition-colors',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')
const inputNormal = `h-11 ${inputBase} border-input hover:border-ring/60 focus:border-primary focus:ring-primary/20`
const inputError  = `h-11 ${inputBase} border-destructive hover:border-destructive focus:border-destructive focus:ring-destructive/20`

interface CreateModuleModalProps {
  open: boolean
  onClose: () => void
}

interface CreateForm {
  name: string
  label: string
  icon: string
  description: string
}

export function CreateModuleModal({ open, onClose }: CreateModuleModalProps) {
  const mutation = useCreateModule()
  const [iconPickerOpen, setIconPickerOpen] = useState(false)

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<CreateForm>({
    defaultValues: { name: '', label: '', icon: 'Package', description: '' },
  })

  const selectedIcon = watch('icon')

  const handleClose = () => {
    reset()
    setIconPickerOpen(false)
    onClose()
  }

  const onSubmit = handleSubmit((data) => {
    const payload: CreateModulePayload = {
      name: data.name,
      label: data.label,
      icon: data.icon,
      ...(data.description && { description: data.description }),
    }
    mutation.mutate(payload, { onSuccess: handleClose })
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-background shadow-xl border border-border max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background">
          <h2 className="text-base font-semibold text-foreground">Nuevo módulo</h2>
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
          {/* Name (slug) */}
          <div className="space-y-1.5">
            <label htmlFor="cm-name" className="block text-sm font-medium text-foreground">
              Identificador (slug) <span className="text-destructive">*</span>
            </label>
            <input
              id="cm-name"
              autoComplete="off"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'cm-name-err' : 'cm-name-hint'}
              {...register('name', {
                required: 'Requerido',
                pattern: { value: /^[a-z0-9-]+$/, message: 'Solo minúsculas, números y guiones' },
              })}
              disabled={mutation.isPending}
              placeholder="mi-modulo"
              className={`${errors.name ? inputError : inputNormal} font-mono`}
            />
            {errors.name ? (
              <p id="cm-name-err" role="alert" className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{errors.name.message}
              </p>
            ) : (
              <p id="cm-name-hint" className="text-xs text-muted-foreground">No se puede cambiar después de crear.</p>
            )}
          </div>

          {/* Label */}
          <div className="space-y-1.5">
            <label htmlFor="cm-label" className="block text-sm font-medium text-foreground">
              Nombre visible <span className="text-destructive">*</span>
            </label>
            <input
              id="cm-label"
              aria-invalid={!!errors.label}
              aria-describedby={errors.label ? 'cm-label-err' : undefined}
              {...register('label', { required: 'Requerido' })}
              disabled={mutation.isPending}
              placeholder="Mi Módulo"
              className={errors.label ? inputError : inputNormal}
            />
            {errors.label && (
              <p id="cm-label-err" role="alert" className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{errors.label.message}
              </p>
            )}
          </div>

          {/* Icon picker */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Icono <span className="text-destructive">*</span>
            </label>
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
                rules={{ required: 'Requerido' }}
                render={({ field }) => (
                  <IconPicker
                    value={field.value}
                    onChange={(v) => { field.onChange(v); setIconPickerOpen(false) }}
                  />
                )}
              />
            )}
            {errors.icon && (
              <p role="alert" className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{errors.icon.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="cm-desc" className="block text-sm font-medium text-foreground">
              Descripción <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
            </label>
            <input
              id="cm-desc"
              {...register('description')}
              disabled={mutation.isPending}
              placeholder="Descripción del módulo"
              className={inputNormal}
            />
          </div>

          {/* Mutation error */}
          {mutation.isError && (
            <div role="alert" className="flex items-start gap-2.5 rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">No se pudo crear el módulo. Intenta de nuevo.</p>
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
                'Crear módulo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
