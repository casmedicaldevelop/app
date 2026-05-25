import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, TrendingDown, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useStopMaxItem } from '../hooks/useStopMaxItem'
import { useUpdateStopMax } from '../hooks/useUpdateStopMax'
import type { UpdateStopMaxPayload } from '../types/stop-max.types'

interface EditForm {
  product: string
  cum: string
  price: number
}

const inputBase = [
  'h-11 w-full rounded-lg border bg-background px-3.5 text-sm',
  'focus:outline-none focus:ring-2 transition-colors',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')

const inputNormal = `${inputBase} border-input hover:border-ring/60 focus:border-primary focus:ring-primary/20`
const inputError  = `${inputBase} border-destructive hover:border-destructive focus:border-destructive focus:ring-destructive/20`

export default function StopMaxEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const numericId = id ? parseInt(id, 10) : 0
  const mutation = useUpdateStopMax(numericId)

  const { data: record, isLoading, isError } = useStopMaxItem(numericId)

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<EditForm>()

  useEffect(() => {
    if (record) {
      reset({
        product: record.product,
        cum: record.cum ?? '',
        price: record.price,
      })
    }
  }, [record, reset])

  const onSubmit = handleSubmit((data) => {
    const payload: UpdateStopMaxPayload = {
      product: data.product.trim(),
      cum: data.cum.trim() !== '' ? data.cum.trim() : null,
      price: Number(data.price),
    }
    mutation.mutate(payload, {
      onSuccess: () => navigate('/dashboard/stop-max'),
    })
  })

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-background shadow-sm animate-pulse">
        <div className="px-6 pt-5 pb-5 border-b border-border space-y-4">
          <div className="h-4 w-36 bg-muted rounded" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-muted rounded-lg shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-48 bg-muted rounded" />
              <div className="h-3.5 w-16 bg-muted rounded" />
            </div>
          </div>
        </div>
        <div className="px-6 py-6 space-y-5">
          {[1, 2].map((i) => (
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

  if (isError || !record) {
    return (
      <div className="rounded-xl border border-border bg-background shadow-sm p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto mb-3">
          <AlertCircle className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-foreground">Registro no encontrado</p>
        <p className="text-xs text-muted-foreground mt-1">El tope máximo con id <span className="font-mono">{numericId}</span> no existe.</p>
        <button
          type="button"
          onClick={() => navigate('/dashboard/stop-max')}
          className="mt-4 text-sm text-primary hover:underline cursor-pointer"
        >
          Volver a Topes Máximos
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-background shadow-sm">

      {/* Header */}
      <div className="px-6 pt-5 pb-5 border-b border-border space-y-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard/stop-max')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a Topes Máximos
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{record.product}</h1>
            <p className="text-sm text-muted-foreground font-mono">#{record.id}</p>
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
                {(mutation.error as { message?: string })?.message ?? 'No se pudieron guardar los cambios'}
              </p>
            </div>
          )}

          {/* Producto */}
          <div className="space-y-1.5">
            <label htmlFor="sme-product" className="block text-sm font-medium text-foreground">
              Producto <span className="text-destructive">*</span>
            </label>
            <input
              id="sme-product"
              autoComplete="off"
              aria-invalid={!!errors.product}
              aria-describedby={errors.product ? 'sme-product-error' : undefined}
              {...register('product', { required: 'El nombre del producto es requerido' })}
              disabled={mutation.isPending}
              className={errors.product ? inputError : inputNormal}
            />
            {errors.product && (
              <p id="sme-product-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{errors.product.message}
              </p>
            )}
          </div>

          {/* CUM + Precio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="sme-cum" className="block text-sm font-medium text-foreground">
                CUM <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
              </label>
              <input
                id="sme-cum"
                autoComplete="off"
                {...register('cum')}
                disabled={mutation.isPending}
                className={`${inputNormal} font-mono`}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sme-price" className="block text-sm font-medium text-foreground">
                Precio máximo <span className="text-destructive">*</span>
              </label>
              <input
                id="sme-price"
                type="number"
                min="0"
                aria-invalid={!!errors.price}
                aria-describedby={errors.price ? 'sme-price-error' : undefined}
                {...register('price', {
                  required: 'El precio es requerido',
                  min: { value: 0, message: 'Mínimo 0' },
                  valueAsNumber: true,
                })}
                disabled={mutation.isPending}
                className={errors.price ? inputError : inputNormal}
              />
              {errors.price && (
                <p id="sme-price-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.price.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20 rounded-b-xl">
          <button
            type="button"
            onClick={() => navigate('/dashboard/stop-max')}
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
