import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Package, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useProduct } from '../hooks/useProduct'
import { useUpdateProduct } from '../hooks/useUpdateProduct'
import type { UpdateProductPayload } from '../types/products.types'

interface EditForm {
  product: string
  cum: string
  box: number
  unit: number
  lot: string
  warehouse: number
  isActive: boolean
}

const inputBase = [
  'h-11 w-full rounded-lg border bg-background px-3.5 text-sm',
  'focus:outline-none focus:ring-2 transition-colors',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')

const inputNormal = `${inputBase} border-input hover:border-ring/60 focus:border-primary focus:ring-primary/20`
const inputError  = `${inputBase} border-destructive hover:border-destructive focus:border-destructive focus:ring-destructive/20`

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>()
  const productId = id ? parseInt(id, 10) : 0
  const navigate = useNavigate()
  const mutation = useUpdateProduct(productId)

  const { data: product, isLoading, isError } = useProduct(productId)

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<EditForm>()

  useEffect(() => {
    if (product) {
      reset({
        product: product.product,
        cum: product.cum ?? '',
        box: product.box,
        unit: product.unit,
        lot: product.lot,
        warehouse: product.warehouse,
        isActive: product.isActive,
      })
    }
  }, [product, reset])

  const onSubmit = handleSubmit((data) => {
    const payload: UpdateProductPayload = {
      product: data.product.trim(),
      cum: data.cum.trim() !== '' ? data.cum.trim() : null,
      box: Number(data.box),
      unit: Number(data.unit),
      lot: data.lot.trim(),
      warehouse: Number(data.warehouse),
      isActive: data.isActive,
    }
    mutation.mutate(payload, {
      onSuccess: () => navigate('/dashboard/products'),
    })
  })

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-background shadow-sm animate-pulse">
        <div className="px-6 pt-5 pb-5 border-b border-border space-y-4">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-muted rounded-lg shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-48 bg-muted rounded" />
              <div className="h-3.5 w-24 bg-muted rounded" />
            </div>
          </div>
        </div>
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

  if (isError || !product) {
    return (
      <div className="rounded-xl border border-border bg-background shadow-sm p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto mb-3">
          <AlertCircle className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-foreground">Producto no encontrado</p>
        <p className="text-xs text-muted-foreground mt-1">El ID <span className="font-mono">{productId}</span> no corresponde a ningún producto.</p>
        <button
          type="button"
          onClick={() => navigate('/dashboard/products')}
          className="mt-4 text-sm text-primary hover:underline cursor-pointer"
        >
          Volver a Productos
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
          onClick={() => navigate('/dashboard/products')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a Productos
        </button>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
            ${product.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
          >
            <Package className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{product.product}</h1>
            <p className="text-sm text-muted-foreground font-mono">{product.code}</p>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold
            ${product.isActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-muted text-muted-foreground border border-border'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${product.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/60'}`} />
            {product.isActive ? 'Activo' : 'Inactivo'}
          </span>
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

          {/* Código (read-only) + Nombre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Código</label>
              <div className="h-11 flex items-center rounded-lg border border-input bg-muted/40 px-3.5">
                <span className="text-sm font-mono text-muted-foreground">{product.code}</span>
              </div>
              <p className="text-xs text-muted-foreground">El código no puede modificarse.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pe-product" className="block text-sm font-medium text-foreground">
                Nombre del producto <span className="text-destructive">*</span>
              </label>
              <input
                id="pe-product"
                autoComplete="off"
                aria-invalid={!!errors.product}
                aria-describedby={errors.product ? 'pe-product-error' : undefined}
                {...register('product', { required: 'El nombre es requerido' })}
                disabled={mutation.isPending}
                className={errors.product ? inputError : inputNormal}
              />
              {errors.product && (
                <p id="pe-product-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.product.message}
                </p>
              )}
            </div>
          </div>

          {/* Lote + Bodega */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pe-lote" className="block text-sm font-medium text-foreground">
                Lote <span className="text-destructive">*</span>
              </label>
              <input
                id="pe-lote"
                autoComplete="off"
                aria-invalid={!!errors.lot}
                aria-describedby={errors.lot ? 'pe-lote-error' : undefined}
                {...register('lot', { required: 'El lote es requerido' })}
                disabled={mutation.isPending}
                className={`${errors.lot ? inputError : inputNormal} font-mono`}
              />
              {errors.lot && (
                <p id="pe-lote-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.lot.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pe-bodega" className="block text-sm font-medium text-foreground">
                Bodega <span className="text-destructive">*</span>
              </label>
              <input
                id="pe-bodega"
                type="number"
                min="0"
                autoComplete="off"
                aria-invalid={!!errors.warehouse}
                aria-describedby={errors.warehouse ? 'pe-bodega-error' : undefined}
                {...register('warehouse', { required: 'La bodega es requerida', valueAsNumber: true })}
                disabled={mutation.isPending}
                className={errors.warehouse ? inputError : inputNormal}
              />
              {errors.warehouse && (
                <p id="pe-bodega-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.warehouse.message}
                </p>
              )}
            </div>
          </div>

          {/* CUM */}
          <div className="space-y-1.5">
            <label htmlFor="pe-cum" className="block text-sm font-medium text-foreground">
              CUM <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
            </label>
            <input
              id="pe-cum"
              autoComplete="off"
              {...register('cum')}
              disabled={mutation.isPending}
              className={`${inputNormal} font-mono`}
            />
          </div>

          {/* Cajas + Unidades */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pe-box" className="block text-sm font-medium text-foreground">
                Cajas <span className="text-destructive">*</span>
              </label>
              <input
                id="pe-box"
                type="number"
                min="0"
                aria-invalid={!!errors.box}
                aria-describedby={errors.box ? 'pe-box-error' : undefined}
                {...register('box', {
                  required: 'Requerido',
                  min: { value: 0, message: 'Mínimo 0' },
                  valueAsNumber: true,
                })}
                disabled={mutation.isPending}
                className={errors.box ? inputError : inputNormal}
              />
              {errors.box && (
                <p id="pe-box-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.box.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pe-unit" className="block text-sm font-medium text-foreground">
                Unidades <span className="text-destructive">*</span>
              </label>
              <input
                id="pe-unit"
                type="number"
                min="0"
                aria-invalid={!!errors.unit}
                aria-describedby={errors.unit ? 'pe-unit-error' : undefined}
                {...register('unit', {
                  required: 'Requerido',
                  min: { value: 0, message: 'Mínimo 0' },
                  valueAsNumber: true,
                })}
                disabled={mutation.isPending}
                className={errors.unit ? inputError : inputNormal}
              />
              {errors.unit && (
                <p id="pe-unit-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.unit.message}
                </p>
              )}
            </div>
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
            <span className="text-sm font-medium text-foreground">Producto activo</span>
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
