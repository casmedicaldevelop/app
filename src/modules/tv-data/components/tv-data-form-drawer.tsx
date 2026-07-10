import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { X, AlertCircle } from 'lucide-react'
import { useCreateTvData } from '../hooks/useCreateTvData'
import { useUpdateTvData } from '../hooks/useUpdateTvData'
import type { TvData, CreateTvDataPayload, UpdateTvDataPayload } from '../types/tv-data.types'

interface FormValues {
  code: string
  name: string
  inventoryCode: string
  price: number
}

interface Props {
  mode: 'create' | 'edit'
  record?: TvData
  onClose: () => void
}

const inputBase =
  'h-11 w-full rounded-lg border bg-background px-3.5 text-sm focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
const inputNormal = `${inputBase} border-input hover:border-ring/60 focus:border-primary focus:ring-primary/20`
const inputError = `${inputBase} border-destructive hover:border-destructive focus:border-destructive focus:ring-destructive/20`

export default function TvDataFormDrawer({ mode, record, onClose }: Props) {
  const createMut = useCreateTvData()
  const updateMut = useUpdateTvData(record?.id ?? 0)
  const mutation = mode === 'edit' ? updateMut : createMut

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      code: record?.code ?? '',
      name: record?.name ?? '',
      inventoryCode: record?.inventoryCode ?? '',
      price: record?.price ?? 0,
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
    const inv = data.inventoryCode.trim()
    if (mode === 'create') {
      const payload: CreateTvDataPayload = {
        code: data.code.trim(),
        name: data.name.trim(),
        ...(inv ? { inventoryCode: inv } : {}),
        price: Number(data.price),
      }
      createMut.mutate(payload, { onSuccess: onClose })
    } else {
      const payload: UpdateTvDataPayload = {
        code: data.code.trim(),
        name: data.name.trim(),
        inventoryCode: inv === '' ? null : inv,
        price: Number(data.price),
      }
      updateMut.mutate(payload, { onSuccess: onClose })
    }
  })

  const errMsg =
    (mutation.error as { message?: string } | null)?.message ??
    (mode === 'create' ? 'No se pudo crear el registro' : 'No se pudieron guardar los cambios')

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 bg-[#2d3436]/40" onClick={onClose} aria-hidden="true" />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[460px] flex-col bg-background shadow-2xl"
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

            <div className="space-y-1.5">
              <label htmlFor="tvf-code" className="block text-sm font-medium text-foreground">
                Código <span className="text-destructive">*</span>
              </label>
              <input
                id="tvf-code"
                autoComplete="off"
                aria-invalid={!!errors.code}
                {...register('code', { required: 'El código es requerido' })}
                disabled={mutation.isPending}
                placeholder="TV001"
                className={errors.code ? inputError : inputNormal}
              />
              {errors.code && (
                <p role="alert" className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.code.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tvf-name" className="block text-sm font-medium text-foreground">
                Nombre <span className="text-destructive">*</span>
              </label>
              <input
                id="tvf-name"
                autoComplete="off"
                aria-invalid={!!errors.name}
                {...register('name', { required: 'El nombre es requerido' })}
                disabled={mutation.isPending}
                placeholder="Nombre del registro"
                className={errors.name ? inputError : inputNormal}
              />
              {errors.name && (
                <p role="alert" className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tvf-inventory" className="block text-sm font-medium text-foreground">
                Código de inventario
              </label>
              <input
                id="tvf-inventory"
                autoComplete="off"
                {...register('inventoryCode')}
                disabled={mutation.isPending}
                placeholder="Dejar vacío si no aplica"
                className={inputNormal}
              />
              <p className="text-xs text-muted-foreground">Opcional. Código del producto en el inventario local, si existe.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tvf-price" className="block text-sm font-medium text-foreground">
                Precio (COP) <span className="text-destructive">*</span>
              </label>
              <input
                id="tvf-price"
                type="number"
                inputMode="numeric"
                step={1}
                min={0}
                autoComplete="off"
                aria-invalid={!!errors.price}
                {...register('price', {
                  required: 'El precio es requerido',
                  valueAsNumber: true,
                  min: { value: 0, message: 'El precio debe ser ≥ 0' },
                  validate: (v) => Number.isInteger(Number(v)) || 'Debe ser un entero sin decimales',
                })}
                disabled={mutation.isPending}
                placeholder="0"
                className={errors.price ? inputError : inputNormal}
              />
              {errors.price && (
                <p role="alert" className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.price.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 border-t border-border bg-muted/20 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="h-10 flex-1 cursor-pointer rounded-lg border border-input text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || (mode === 'edit' && !isDirty)}
              className="h-10 flex-1 cursor-pointer rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mutation.isPending
                ? mode === 'create'
                  ? 'Creando...'
                  : 'Guardando...'
                : mode === 'create'
                  ? 'Crear registro'
                  : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </aside>
    </>,
    document.body,
  )
}
