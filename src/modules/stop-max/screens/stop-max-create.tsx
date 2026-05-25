import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingDown, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useCreateStopMax } from '../hooks/useCreateStopMax'
import type { CreateStopMaxPayload } from '../types/stop-max.types'

interface CreateForm {
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

export default function StopMaxCreatePage() {
  const navigate = useNavigate()
  const mutation = useCreateStopMax()

  const { register, handleSubmit, formState: { errors } } = useForm<CreateForm>({
    defaultValues: { product: '', cum: '', price: 0 },
  })

  const onSubmit = handleSubmit((data) => {
    const payload: CreateStopMaxPayload = {
      product: data.product.trim(),
      cum: data.cum.trim() !== '' ? data.cum.trim() : null,
      price: Number(data.price),
    }
    mutation.mutate(payload, {
      onSuccess: () => navigate('/dashboard/stop-max'),
    })
  })

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
          <div>
            <h1 className="text-xl font-bold text-foreground">Nuevo tope máximo</h1>
            <p className="text-sm text-muted-foreground">Agrega un precio máximo al catálogo</p>
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
                {(mutation.error as { message?: string })?.message ?? 'No se pudo crear el tope máximo'}
              </p>
            </div>
          )}

          {/* Producto */}
          <div className="space-y-1.5">
            <label htmlFor="sm-product" className="block text-sm font-medium text-foreground">
              Producto <span className="text-destructive">*</span>
            </label>
            <input
              id="sm-product"
              autoComplete="off"
              aria-invalid={!!errors.product}
              aria-describedby={errors.product ? 'sm-product-error' : undefined}
              {...register('product', { required: 'El nombre del producto es requerido' })}
              disabled={mutation.isPending}
              placeholder="Paracetamol 500mg"
              className={errors.product ? inputError : inputNormal}
            />
            {errors.product && (
              <p id="sm-product-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{errors.product.message}
              </p>
            )}
          </div>

          {/* CUM + Precio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="sm-cum" className="block text-sm font-medium text-foreground">
                CUM <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
              </label>
              <input
                id="sm-cum"
                autoComplete="off"
                {...register('cum')}
                disabled={mutation.isPending}
                placeholder="20161254-1"
                className={`${inputNormal} font-mono`}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sm-price" className="block text-sm font-medium text-foreground">
                Precio máximo <span className="text-destructive">*</span>
              </label>
              <input
                id="sm-price"
                type="number"
                min="0"
                aria-invalid={!!errors.price}
                aria-describedby={errors.price ? 'sm-price-error' : undefined}
                {...register('price', {
                  required: 'El precio es requerido',
                  min: { value: 0, message: 'Mínimo 0' },
                  valueAsNumber: true,
                })}
                disabled={mutation.isPending}
                placeholder="15000"
                className={errors.price ? inputError : inputNormal}
              />
              {errors.price && (
                <p id="sm-price-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
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
            ) : 'Crear tope'}
          </button>
        </div>
      </form>
    </div>
  )
}
