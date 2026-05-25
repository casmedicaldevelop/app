import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Boxes, AlertCircle, ChevronDown } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { useCreateModule } from '../hooks/useCreateModule'
import { IconPicker, renderIcon } from '../components/IconPicker'
import type { CreateModulePayload } from '../types/modules.types'

interface CreateForm {
  name: string
  label: string
  icon: string
  description: string
}

const inputBase = [
  'h-11 w-full rounded-lg border bg-background px-3.5 text-sm',
  'focus:outline-none focus:ring-2 transition-colors',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')

const inputNormal = `${inputBase} border-input hover:border-ring/60 focus:border-primary focus:ring-primary/20`
const inputError  = `${inputBase} border-destructive hover:border-destructive focus:border-destructive focus:ring-destructive/20`

export default function ModuleCreatePage() {
  const navigate = useNavigate()
  const mutation = useCreateModule()
  const [iconPickerOpen, setIconPickerOpen] = useState(false)

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<CreateForm>({
    defaultValues: { name: '', label: '', icon: 'Package', description: '' },
  })

  const selectedIcon = watch('icon')

  const onSubmit = handleSubmit((data) => {
    const payload: CreateModulePayload = {
      name: data.name,
      label: data.label,
      icon: data.icon,
      ...(data.description && { description: data.description }),
    }
    mutation.mutate(payload, {
      onSuccess: () => navigate('/dashboard/modules'),
    })
  })

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
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Nuevo módulo</h1>
            <p className="text-sm text-muted-foreground">Crea una nueva sección del sistema</p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate>
        <div className="px-6 py-6 space-y-5">

          {/* Mutation error */}
          {mutation.isError && (
            <div role="alert" className="flex items-start gap-2.5 rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                No se pudo crear el módulo. Verifica los datos e intenta de nuevo.
              </p>
            </div>
          )}

          {/* Name slug + Label (2-column) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="mc-name" className="block text-sm font-medium text-foreground">
                Identificador (slug) <span className="text-destructive">*</span>
              </label>
              <input
                id="mc-name"
                autoComplete="off"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'mc-name-error' : 'mc-name-hint'}
                {...register('name', {
                  required: 'El identificador es requerido',
                  pattern: { value: /^[a-z0-9-]+$/, message: 'Solo minúsculas, números y guiones' },
                })}
                disabled={mutation.isPending}
                placeholder="mi-modulo"
                className={errors.name ? inputError : inputNormal}
              />
              {errors.name ? (
                <p id="mc-name-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.name.message}
                </p>
              ) : (
                <p id="mc-name-hint" className="text-xs text-muted-foreground">No se puede cambiar después de crear.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="mc-label" className="block text-sm font-medium text-foreground">
                Nombre visible <span className="text-destructive">*</span>
              </label>
              <input
                id="mc-label"
                autoComplete="off"
                aria-invalid={!!errors.label}
                aria-describedby={errors.label ? 'mc-label-error' : undefined}
                {...register('label', { required: 'El nombre visible es requerido' })}
                disabled={mutation.isPending}
                placeholder="Mi Módulo"
                className={errors.label ? inputError : inputNormal}
              />
              {errors.label && (
                <p id="mc-label-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.label.message}
                </p>
              )}
            </div>
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
                rules={{ required: 'Selecciona un icono' }}
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
            <label htmlFor="mc-desc" className="block text-sm font-medium text-foreground">
              Descripción <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
            </label>
            <textarea
              id="mc-desc"
              {...register('description')}
              disabled={mutation.isPending}
              rows={3}
              placeholder="Breve descripción del módulo..."
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm
                         hover:border-ring/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors resize-none"
            />
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
            ) : 'Crear módulo'}
          </button>
        </div>
      </form>
    </div>
  )
}
