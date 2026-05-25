import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useCreateProduct } from '../hooks/useCreateProduct'
import type { CreateProductPayload } from '../types/products.types'

interface CreateForm {
  code: string
  product: string
  cum: string
  box: number
  unit: number
  lot: string
  warehouse: number
}

const inputBase = [
  'h-11 w-full rounded-lg border bg-background px-3.5 text-sm',
  'focus:outline-none focus:ring-2 transition-colors',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')

const inputNormal = `${inputBase} border-input hover:border-ring/60 focus:border-primary focus:ring-primary/20`
const inputError  = `${inputBase} border-destructive hover:border-destructive focus:border-destructive focus:ring-destructive/20`

export default function ProductCreatePage() {
  const navigate = useNavigate()
  const mutation = useCreateProduct()

  const { register, handleSubmit, formState: { errors } } = useForm<CreateForm>({
    defaultValues: { code: '', product: '', cum: '', box: 0, unit: 0, lot: '', warehouse: 0 },
  })

  const onSubmit = handleSubmit((data) => {
    const payload: CreateProductPayload = {
      code: data.code.trim(),
      product: data.product.trim(),
      cum: data.cum.trim() !== '' ? data.cum.trim() : null,
      box: Number(data.box),
      unit: Number(data.unit),
      lot: data.lot.trim(),
      warehouse: Number(data.warehouse),
    }
    mutation.mutate(payload, {
      onSuccess: () => navigate('/dashboard/products'),
    })
  })

  return (
    <div className="rounded-xl border border-border bg-background shadow-sm">

      {/* Header */}
      <div className="px-6 pt-5 pb-5 border-b border-border space-y-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard/products')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a Productos
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Nuevo producto</h1>
            <p className="text-sm text-muted-foreground">Agrega un producto al catálogo</p>
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
                {(mutation.error as { message?: string })?.message ?? 'No se pudo crear el producto'}
              </p>
            </div>
          )}

          {/* Código + Producto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pc-code" className="block text-sm font-medium text-foreground">
                Código <span className="text-destructive">*</span>
              </label>
              <input
                id="pc-code"
                autoComplete="off"
                aria-invalid={!!errors.code}
                aria-describedby={errors.code ? 'pc-code-error' : 'pc-code-hint'}
                {...register('code', { required: 'El código es requerido' })}
                disabled={mutation.isPending}
                placeholder="PROD-001"
                className={`${errors.code ? inputError : inputNormal} font-mono`}
              />
              {errors.code ? (
                <p id="pc-code-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.code.message}
                </p>
              ) : (
                <p id="pc-code-hint" className="text-xs text-muted-foreground">Puede repetirse si el lote o bodega difieren.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pc-product" className="block text-sm font-medium text-foreground">
                Nombre del producto <span className="text-destructive">*</span>
              </label>
              <input
                id="pc-product"
                autoComplete="off"
                aria-invalid={!!errors.product}
                aria-describedby={errors.product ? 'pc-product-error' : undefined}
                {...register('product', { required: 'El nombre es requerido' })}
                disabled={mutation.isPending}
                placeholder="Paracetamol 500mg"
                className={errors.product ? inputError : inputNormal}
              />
              {errors.product && (
                <p id="pc-product-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.product.message}
                </p>
              )}
            </div>
          </div>

          {/* Lote + Bodega */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pc-lote" className="block text-sm font-medium text-foreground">
                Lote <span className="text-destructive">*</span>
              </label>
              <input
                id="pc-lote"
                autoComplete="off"
                aria-invalid={!!errors.lot}
                aria-describedby={errors.lot ? 'pc-lote-error' : undefined}
                {...register('lot', { required: 'El lote es requerido' })}
                disabled={mutation.isPending}
                placeholder="L2024-001"
                className={`${errors.lot ? inputError : inputNormal} font-mono`}
              />
              {errors.lot && (
                <p id="pc-lote-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.lot.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pc-bodega" className="block text-sm font-medium text-foreground">
                Bodega <span className="text-destructive">*</span>
              </label>
              <input
                id="pc-bodega"
                type="number"
                min="0"
                autoComplete="off"
                aria-invalid={!!errors.warehouse}
                aria-describedby={errors.warehouse ? 'pc-bodega-error' : undefined}
                {...register('warehouse', { required: 'La bodega es requerida', valueAsNumber: true })}
                disabled={mutation.isPending}
                placeholder="1"
                className={errors.warehouse ? inputError : inputNormal}
              />
              {errors.warehouse && (
                <p id="pc-bodega-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.warehouse.message}
                </p>
              )}
            </div>
          </div>

          {/* CUM */}
          <div className="space-y-1.5">
            <label htmlFor="pc-cum" className="block text-sm font-medium text-foreground">
              CUM <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
            </label>
            <input
              id="pc-cum"
              autoComplete="off"
              {...register('cum')}
              disabled={mutation.isPending}
              placeholder="20161254-1"
              className={`${inputNormal} font-mono`}
            />
          </div>

          {/* Cajas + Unidades */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pc-box" className="block text-sm font-medium text-foreground">
                Cajas <span className="text-destructive">*</span>
              </label>
              <input
                id="pc-box"
                type="number"
                min="0"
                aria-invalid={!!errors.box}
                aria-describedby={errors.box ? 'pc-box-error' : undefined}
                {...register('box', {
                  required: 'Requerido',
                  min: { value: 0, message: 'Mínimo 0' },
                  valueAsNumber: true,
                })}
                disabled={mutation.isPending}
                className={errors.box ? inputError : inputNormal}
              />
              {errors.box && (
                <p id="pc-box-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.box.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pc-unit" className="block text-sm font-medium text-foreground">
                Unidades <span className="text-destructive">*</span>
              </label>
              <input
                id="pc-unit"
                type="number"
                min="0"
                aria-invalid={!!errors.unit}
                aria-describedby={errors.unit ? 'pc-unit-error' : undefined}
                {...register('unit', {
                  required: 'Requerido',
                  min: { value: 0, message: 'Mínimo 0' },
                  valueAsNumber: true,
                })}
                disabled={mutation.isPending}
                className={errors.unit ? inputError : inputNormal}
              />
              {errors.unit && (
                <p id="pc-unit-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.unit.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20 rounded-b-xl">
          <button
            type="button"
            onClick={() => navigate('/dashboard/products')}
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
            ) : 'Crear producto'}
          </button>
        </div>
      </form>
    </div>
  )
}
