import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForm, Controller } from 'react-hook-form'
import { X, AlertCircle } from 'lucide-react'
import SearchableSelect from '@/shared/components/searchable-select'
import { useCreateTvInsEvento, useUpdateTvInsEvento } from '../hooks/useTvInsEvento'
import { useMeasurementUnits, usePharmaceuticalForms, useScientificUnits } from '../hooks/useCatalogs'
import type { TvInsEvento } from '../types/tvins-evento.types'

interface FormValues {
  cum: string
  name: string
  value: number
  concentration: string
  presentation: string
  administrationRoute: string
  shortName: string
  measurementUnit: string
  pharmaceuticalForm: string
  dispensingUnit: string
}

interface Props {
  mode: 'create' | 'edit'
  record?: TvInsEvento
  onClose: () => void
}

const LABEL = 'mb-1 block text-xs font-medium text-foreground'
const FIELD =
  'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50'
const FIELD_ERR =
  'h-10 w-full rounded-lg border border-destructive bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-destructive/20'

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p role="alert" className="mt-1 flex items-center gap-1 text-xs text-destructive">
      <AlertCircle className="h-3 w-3" />
      {msg}
    </p>
  )
}

export default function TvInsEventoFormDrawer({ mode, record, onClose }: Props) {
  const createMut = useCreateTvInsEvento()
  const updateMut = useUpdateTvInsEvento(record?.id ?? 0)
  const mutation = mode === 'edit' ? updateMut : createMut

  const { data: units = [] } = useMeasurementUnits()
  const { data: forms = [] } = usePharmaceuticalForms()
  const { data: scientificUnits = [] } = useScientificUnits()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      cum: record?.cum ?? '',
      name: record?.name ?? '',
      value: record?.value ?? 0,
      concentration: record?.concentration ?? '',
      presentation: record?.presentation ?? '',
      administrationRoute: record?.administrationRoute ?? '',
      shortName: record?.shortName ?? '',
      measurementUnit: record ? String(record.measurementUnit) : '',
      pharmaceuticalForm: record?.pharmaceuticalForm ?? '',
      dispensingUnit: record ? String(record.dispensingUnit) : '',
    },
  })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const onSubmit = handleSubmit((data) => {
    const payload = {
      cum: data.cum.trim(),
      name: data.name.trim(),
      value: Number(data.value),
      concentration: data.concentration.trim(),
      presentation: data.presentation.trim(),
      administrationRoute: data.administrationRoute.trim(),
      shortName: data.shortName.trim(),
      measurementUnit: Number(data.measurementUnit),
      pharmaceuticalForm: data.pharmaceuticalForm,
      dispensingUnit: Number(data.dispensingUnit),
    }
    if (mode === 'create') createMut.mutate(payload, { onSuccess: onClose })
    else updateMut.mutate(payload, { onSuccess: onClose })
  })

  const errMsg =
    (mutation.error as { message?: string } | null)?.message ??
    (mode === 'create' ? 'No se pudo crear el registro' : 'No se pudieron guardar los cambios')

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 bg-[#2d3436]/40" onClick={onClose} aria-hidden="true" />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] flex-col bg-background shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'create' ? 'Nuevo registro' : 'Editar registro'}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">
            {mode === 'create' ? 'Nuevo registro' : 'Editar registro'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} noValidate className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {mutation.isError && (
              <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/8 px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{errMsg}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ev-cum" className={LABEL}>CUM <span className="text-destructive">*</span></label>
                <input id="ev-cum" autoComplete="off" disabled={mutation.isPending}
                  {...register('cum', { required: 'Requerido' })}
                  className={errors.cum ? FIELD_ERR : FIELD} />
                <FieldError msg={errors.cum?.message} />
              </div>
              <div>
                <label htmlFor="ev-value" className={LABEL}>Valor (COP) <span className="text-destructive">*</span></label>
                <input id="ev-value" type="number" inputMode="numeric" step={1} min={0} autoComplete="off" disabled={mutation.isPending}
                  {...register('value', {
                    required: 'Requerido',
                    valueAsNumber: true,
                    min: { value: 0, message: '≥ 0' },
                    validate: (v) => Number.isInteger(Number(v)) || 'Entero sin decimales',
                  })}
                  className={errors.value ? FIELD_ERR : FIELD} />
                <FieldError msg={errors.value?.message} />
              </div>
            </div>

            <div>
              <label htmlFor="ev-name" className={LABEL}>Nombre <span className="text-destructive">*</span></label>
              <input id="ev-name" autoComplete="off" disabled={mutation.isPending}
                {...register('name', { required: 'Requerido' })}
                className={errors.name ? FIELD_ERR : FIELD} />
              <FieldError msg={errors.name?.message} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ev-concentration" className={LABEL}>Concentración <span className="text-destructive">*</span></label>
                <input id="ev-concentration" autoComplete="off" disabled={mutation.isPending}
                  {...register('concentration', { required: 'Requerido' })}
                  className={errors.concentration ? FIELD_ERR : FIELD} />
                <FieldError msg={errors.concentration?.message} />
              </div>
              <div>
                <label htmlFor="ev-presentation" className={LABEL}>Presentación <span className="text-destructive">*</span></label>
                <input id="ev-presentation" autoComplete="off" disabled={mutation.isPending}
                  {...register('presentation', { required: 'Requerido' })}
                  className={errors.presentation ? FIELD_ERR : FIELD} />
                <FieldError msg={errors.presentation?.message} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ev-route" className={LABEL}>Vía de administración <span className="text-destructive">*</span></label>
                <input id="ev-route" autoComplete="off" disabled={mutation.isPending}
                  {...register('administrationRoute', { required: 'Requerido' })}
                  className={errors.administrationRoute ? FIELD_ERR : FIELD} />
                <FieldError msg={errors.administrationRoute?.message} />
              </div>
              <div>
                <label htmlFor="ev-short" className={LABEL}>Diminutivo <span className="text-destructive">*</span></label>
                <input id="ev-short" autoComplete="off" disabled={mutation.isPending}
                  {...register('shortName', { required: 'Requerido' })}
                  className={errors.shortName ? FIELD_ERR : FIELD} />
                <FieldError msg={errors.shortName?.message} />
              </div>
            </div>

            <div>
              <label htmlFor="ev-form" className={LABEL}>Forma farmacéutica <span className="text-destructive">*</span></label>
              <Controller
                name="pharmaceuticalForm"
                control={control}
                rules={{ required: 'Requerido' }}
                render={({ field }) => (
                  <SearchableSelect
                    id="ev-form"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={mutation.isPending}
                    error={!!errors.pharmaceuticalForm}
                    options={forms.map((f) => ({ value: f.code, label: `${f.code} — ${f.description}` }))}
                  />
                )}
              />
              <FieldError msg={errors.pharmaceuticalForm?.message} />
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="ev-mu" className={LABEL}>Unidad de medida <span className="text-destructive">*</span></label>
                <Controller
                  name="measurementUnit"
                  control={control}
                  rules={{ required: 'Requerido' }}
                  render={({ field }) => (
                    <SearchableSelect
                      id="ev-mu"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={mutation.isPending}
                      error={!!errors.measurementUnit}
                      options={scientificUnits.map((u) => ({ value: String(u.code), label: `${u.code} — ${u.name}` }))}
                    />
                  )}
                />
                <FieldError msg={errors.measurementUnit?.message} />
              </div>
              <div>
                <label htmlFor="ev-du" className={LABEL}>Unidad de dispensación <span className="text-destructive">*</span></label>
                <Controller
                  name="dispensingUnit"
                  control={control}
                  rules={{ required: 'Requerido' }}
                  render={({ field }) => (
                    <SearchableSelect
                      id="ev-du"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={mutation.isPending}
                      error={!!errors.dispensingUnit}
                      options={units.map((u) => ({ value: String(u.code), label: `${u.code} — ${u.description}` }))}
                    />
                  )}
                />
                <FieldError msg={errors.dispensingUnit?.message} />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 border-t border-border bg-muted/20 px-5 py-4">
            <button type="button" onClick={onClose} disabled={mutation.isPending}
              className="h-10 flex-1 cursor-pointer rounded-lg border border-input text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="h-10 flex-1 cursor-pointer rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed">
              {mutation.isPending
                ? mode === 'create' ? 'Creando...' : 'Guardando...'
                : mode === 'create' ? 'Crear registro' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </aside>
    </>,
    document.body,
  )
}
