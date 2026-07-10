import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Database, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useCreateTvData } from '../hooks/useCreateTvData'
import type { CreateTvDataPayload } from '../types/tv-data.types'

const inputBase = [
  'h-11 w-full rounded-lg border bg-background px-3.5 text-sm',
  'focus:outline-none focus:ring-2 transition-colors',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')

const inputNormal = `${inputBase} border-input hover:border-ring/60 focus:border-primary focus:ring-primary/20`
const inputError  = `${inputBase} border-destructive hover:border-destructive focus:border-destructive focus:ring-destructive/20`

export default function TvDataCreatePage() {
  const navigate = useNavigate()
  const mutation = useCreateTvData()

  const { register, handleSubmit, formState: { errors } } = useForm<CreateTvDataPayload>({
    defaultValues: { code: '', name: '', inventoryCode: '', price: 0 },
  })

  const onSubmit = handleSubmit((data) => {
    const inventoryCode = data.inventoryCode?.trim() ?? ''
    mutation.mutate(
      {
        code: data.code.trim(),
        name: data.name.trim(),
        ...(inventoryCode ? { inventoryCode } : {}),
        price: Number(data.price),
      },
      { onSuccess: () => navigate('/dashboard/tv-data/tvmed-mipres') },
    )
  })

  return (
    <div className="rounded-xl border border-border bg-background shadow-sm">

      <div className="px-6 pt-5 pb-5 border-b border-border space-y-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard/tv-data/tvmed-mipres')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a TvData
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Nuevo registro TvData</h1>
            <p className="text-sm text-muted-foreground">Agrega un nuevo registro al catálogo</p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate>
        <div className="px-6 py-6 space-y-5">

          {mutation.isError && (
            <div role="alert" className="flex items-start gap-2.5 rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                {(mutation.error as { message?: string })?.message ?? 'No se pudo crear el registro'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="tv-code" className="block text-sm font-medium text-foreground">
                Código <span className="text-destructive">*</span>
              </label>
              <input
                id="tv-code"
                autoComplete="off"
                aria-invalid={!!errors.code}
                {...register('code', { required: 'El código es requerido' })}
                disabled={mutation.isPending}
                placeholder="TV001"
                className={errors.code ? inputError : inputNormal}
              />
              {errors.code && (
                <p role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.code.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tv-name" className="block text-sm font-medium text-foreground">
                Nombre <span className="text-destructive">*</span>
              </label>
              <input
                id="tv-name"
                autoComplete="off"
                aria-invalid={!!errors.name}
                {...register('name', { required: 'El nombre es requerido' })}
                disabled={mutation.isPending}
                placeholder="Nombre del registro"
                className={errors.name ? inputError : inputNormal}
              />
              {errors.name && (
                <p role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tv-inventory-code" className="block text-sm font-medium text-foreground">
                Código de inventario
              </label>
              <input
                id="tv-inventory-code"
                autoComplete="off"
                {...register('inventoryCode')}
                disabled={mutation.isPending}
                placeholder="Dejar vacío si no aplica"
                className={inputNormal}
              />
              <p className="text-xs text-muted-foreground">Opcional. Código del producto en el inventario local, si existe.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tv-price" className="block text-sm font-medium text-foreground">
                Precio (COP) <span className="text-destructive">*</span>
              </label>
              <input
                id="tv-price"
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
                <p role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.price.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20 rounded-b-xl">
          <button
            type="button"
            onClick={() => navigate('/dashboard/tv-data/tvmed-mipres')}
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
            ) : 'Crear registro'}
          </button>
        </div>
      </form>
    </div>
  )
}
