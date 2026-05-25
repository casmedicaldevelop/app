import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  ArrowLeft, Search, Upload, Download, X, ChevronLeft, ChevronRight,
  Check, Loader2, Package, FileSpreadsheet, AlertCircle, Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import { useProvider } from '../hooks/useProvider'
import { useUpdateProvider } from '../hooks/useUpdateProvider'
import { useProviderProducts } from '../hooks/useProviderProducts'
import { useBulkUploadProvider } from '../hooks/useBulkUploadProvider'
import { providersService } from '../services/providers.service'
import type { UpdateProviderDto, ProviderProduct } from '../types/providers.types'

const LIMIT = 20
type Tab = 'info' | 'products'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

function formatCurrency(value: number) {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <dt className="text-xs font-medium text-muted-foreground w-28 shrink-0 pt-0.5">{label}</dt>
      <dd className="text-sm text-foreground flex-1 min-w-0 break-words">{value}</dd>
    </div>
  )
}

function BoolBadge({ value, trueLabel = 'Sí', falseLabel = 'No' }: { value: boolean; trueLabel?: string; falseLabel?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium
      ${value
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        : 'bg-muted text-muted-foreground border border-border'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${value ? 'bg-emerald-500' : 'bg-muted-foreground/60'}`} />
      {value ? trueLabel : falseLabel}
    </span>
  )
}

function ProviderProductDetailModal({ product, onClose }: { product: ProviderProduct; onClose: () => void }) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="prov-prod-detail-title"
        className="w-full max-w-sm rounded-xl border border-border bg-background shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 id="prov-prod-detail-title" className="text-sm font-semibold text-foreground">Detalle — Producto</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-md flex items-center justify-center cursor-pointer hover:bg-muted transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <dl className="px-5 py-1">
          <DetailRow label="Código" value={<span className="font-mono text-xs">{product.code}</span>} />
          <DetailRow label="Producto" value={product.product} />
          <DetailRow label="IVA" value={<BoolBadge value={product.iva} />} />
          <DetailRow
            label="CUM"
            value={product.cum
              ? <span className="font-mono text-xs">{product.cum}</span>
              : <span className="text-muted-foreground/50">—</span>
            }
          />
          <DetailRow label="P. por caja" value={<span className="tabular-nums">{formatCurrency(product.priceBox)}</span>} />
          <DetailRow label="P. por unidad" value={<span className="tabular-nums">{formatCurrency(product.priceUnit)}</span>} />
          <DetailRow label="Precio máximo" value={<span className="tabular-nums">{formatCurrency(product.stopBox)}</span>} />
        </dl>

        <div className="px-5 py-3 border-t border-border bg-muted/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 rounded-lg border border-input text-xs font-medium cursor-pointer hover:bg-muted transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductRow({ product, onViewRequest }: { product: ProviderProduct; onViewRequest: (p: ProviderProduct) => void }) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors duration-100">
      <td className="px-4 py-3 font-mono text-xs text-foreground whitespace-nowrap">{product.code}</td>
      <td className="px-4 py-3 text-sm text-foreground max-w-[220px]">
        <span className="truncate block" title={product.product}>{product.product}</span>
      </td>
      <td className="px-4 py-3 text-xs text-center whitespace-nowrap">
        {product.iva
          ? <span className="text-emerald-600 font-medium">Sí</span>
          : <span className="text-muted-foreground/50">No</span>
        }
      </td>
      <td className="px-4 py-3 font-mono text-xs text-muted-foreground hidden lg:table-cell whitespace-nowrap">
        {product.cum ?? <span className="text-muted-foreground/50">—</span>}
      </td>
      <td className="px-4 py-3 text-xs text-foreground tabular-nums text-right hidden sm:table-cell whitespace-nowrap">
        {formatCurrency(product.priceBox)}
      </td>
      <td className="px-4 py-3 text-xs text-foreground tabular-nums text-right hidden md:table-cell whitespace-nowrap">
        {formatCurrency(product.priceUnit)}
      </td>
      <td className="px-4 py-3 text-xs text-foreground tabular-nums text-right hidden md:table-cell whitespace-nowrap">
        {formatCurrency(product.stopBox)}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={() => onViewRequest(product)}
          aria-label="Ver detalle"
          className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-input text-xs
                     cursor-pointer hover:bg-muted transition-all duration-150"
        >
          <Eye className="h-3 w-3" />
        </button>
      </td>
    </tr>
  )
}

interface BulkUploadModalProps {
  providerId: number
  providerName: string
  onClose: () => void
}

function BulkUploadModal({ providerId, providerName, onClose }: BulkUploadModalProps) {
  const [mode, setMode] = useState<'update' | 'upload'>('update')
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const { mutate, isPending } = useBulkUploadProvider(providerId)

  function handleFile(f: File | undefined) {
    if (!f) return
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (!['xlsx', 'xls', 'csv'].includes(ext ?? '')) {
      toast.error('Solo se aceptan archivos .xlsx, .xls o .csv')
      return
    }
    setFile(f)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    mutate({ file, mode }, { onSuccess: () => onClose() })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm rounded-xl border border-border bg-background shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Carga masiva — {providerName}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Archivo CSV o Excel (.xlsx)</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-md flex items-center justify-center cursor-pointer hover:bg-muted transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Archivo</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input
                         px-4 py-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30
                         transition-all duration-150"
            >
              {file ? (
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs font-medium text-foreground">Seleccionar archivo</p>
                  <p className="text-xs text-muted-foreground">.csv, .xlsx — máx. 10 MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => providersService.downloadTemplate(providerId, providerName)}
              className="mt-2.5 w-full flex items-center justify-center gap-2 h-8 rounded-lg
                         border border-emerald-300 bg-emerald-50 text-xs font-medium
                         text-emerald-700 cursor-pointer hover:bg-emerald-100 hover:border-emerald-400
                         active:scale-[0.99] transition-all duration-150"
            >
              <Download className="h-3.5 w-3.5 shrink-0" />
              Descargar plantilla de ejemplo (.xlsx)
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Modo</label>
            <div className="grid grid-cols-2 gap-2">
              {(['update', 'upload'] as const).map((m) => (
                <label
                  key={m}
                  className={`flex flex-col gap-0.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-all duration-150
                    ${mode === m
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-input hover:border-ring/60 text-foreground'
                    }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value={m}
                    checked={mode === m}
                    onChange={() => setMode(m)}
                    className="sr-only"
                  />
                  <span className="text-xs font-semibold">{m === 'update' ? 'Actualizar' : 'Subir'}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">
                    {m === 'update' ? 'Upsert — agrega y modifica' : 'Reemplaza todos los productos'}
                  </span>
                </label>
              ))}
            </div>
            {mode === 'upload' && (
              <p className="mt-2 text-[10px] text-amber-600 leading-snug">
                Esta acción eliminará todos los productos actuales del proveedor.
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 h-8 rounded-lg border border-input text-xs font-medium cursor-pointer
                         hover:bg-muted disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!file || isPending}
              className="flex-1 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-semibold
                         cursor-pointer hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98]
                         transition-all duration-200 shadow-sm inline-flex items-center justify-center gap-1.5"
            >
              {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
              {isPending ? 'Procesando...' : 'Cargar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface MetadataFormValues {
  address: string
  phone: string
  description: string
}

export default function ProviderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const providerId = Number(id)

  const [tab, setTab] = useState<Tab>('info')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showBulk, setShowBulk] = useState(false)
  const [viewProduct, setViewProduct] = useState<ProviderProduct | null>(null)

  const debouncedSearch = useDebounce(search, 350)
  useEffect(() => { setPage(1) }, [debouncedSearch])

  const { data: provider, isLoading: providerLoading, isError: providerError } = useProvider(providerId)
  const { data: productsPage, isLoading: productsLoading } = useProviderProducts(providerId, {
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
  })
  const { mutate: updateProvider, isPending: saving } = useUpdateProvider(providerId)

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<MetadataFormValues>({
    defaultValues: { address: '', phone: '', description: '' },
  })

  useEffect(() => {
    if (provider) {
      reset({
        address: provider.address ?? '',
        phone: provider.phone ?? '',
        description: provider.description ?? '',
      })
    }
  }, [provider, reset])

  function onSave(values: MetadataFormValues) {
    updateProvider({
      address: values.address || null,
      phone: values.phone || null,
      description: values.description || null,
    } satisfies UpdateProviderDto)
  }

  const totalPages = productsPage?.totalPages ?? 1

  if (providerLoading) {
    return (
      <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden animate-pulse">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-md bg-muted shrink-0" />
            <div className="space-y-1.5">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
            </div>
          </div>
          <div className="h-8 w-36 rounded-lg bg-muted" />
        </div>
        <div className="px-6 py-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3.5 w-20 rounded bg-muted" />
              <div className="h-9 rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (providerError || !provider) {
    return (
      <div className="rounded-xl border border-border bg-background shadow-sm p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto mb-3">
          <AlertCircle className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-foreground">Proveedor no encontrado</p>
        <p className="text-xs text-muted-foreground mt-1">El ID proporcionado no corresponde a ningún proveedor.</p>
        <button
          onClick={() => navigate('/dashboard/providers')}
          className="mt-4 text-sm text-primary hover:underline cursor-pointer"
        >
          Volver a Proveedores
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">

        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/providers')}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-input
                hover:bg-muted cursor-pointer transition-colors"
              aria-label="Volver a proveedores"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-foreground">{provider.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">{provider.tableKey}</p>
            </div>
          </div>

          {/* Segmented control */}
          <div
            className="inline-flex items-center bg-muted rounded-lg p-1 gap-0.5"
            role="tablist"
            aria-label="Secciones del proveedor"
          >
            {([
              { key: 'info', label: 'Información' },
              { key: 'products', label: 'Productos' },
            ] as { key: Tab; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium
                  transition-all duration-150 cursor-pointer
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
                  ${tab === key
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {label}
                {key === 'products' && productsPage && productsPage.total > 0 && (
                  <span className={`tabular-nums text-[10px] ${tab === key ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                    {productsPage.total}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab: Información */}
        {tab === 'info' && (
          <form onSubmit={handleSubmit(onSave)}>
            <div className="px-6 py-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="address" className="block text-xs font-medium text-foreground">
                  Dirección
                </label>
                <input
                  id="address"
                  {...register('address')}
                  placeholder="Dirección del proveedor"
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm
                    placeholder:text-muted-foreground focus:border-primary focus:outline-none
                    focus:ring-1 focus:ring-primary/30 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="phone" className="block text-xs font-medium text-foreground">
                  Teléfono
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  placeholder="Teléfono de contacto"
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm
                    placeholder:text-muted-foreground focus:border-primary focus:outline-none
                    focus:ring-1 focus:ring-primary/30 transition-colors"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="description" className="block text-xs font-medium text-foreground">
                  Descripción
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={3}
                  placeholder="Descripción o notas del proveedor"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm
                    placeholder:text-muted-foreground focus:border-primary focus:outline-none
                    focus:ring-1 focus:ring-primary/30 transition-colors resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-3 border-t border-border bg-muted/20">
              <button
                type="submit"
                disabled={!isDirty || saving}
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-primary text-xs
                  font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50
                  disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]
                  transition-all duration-200 shadow-sm"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}

        {/* Tab: Productos */}
        {tab === 'products' && (
          <>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 px-6 py-2.5 border-b border-border bg-muted/20">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Buscar por código, nombre o CUM..."
                  className="h-7 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs
                             placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none
                             focus:ring-1 focus:ring-primary/30 transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowBulk(true)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-input text-xs font-medium
                           cursor-pointer hover:bg-muted transition-all duration-150 shrink-0"
              >
                <Upload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Carga masiva</span>
              </button>
            </div>

            {/* Table */}
            {productsLoading ? (
              <div className="divide-y divide-border">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                    <div className="h-3 flex-1 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-10 bg-muted animate-pulse rounded hidden sm:block" />
                    <div className="h-3 w-16 bg-muted animate-pulse rounded hidden lg:block" />
                    <div className="h-3 w-20 bg-muted animate-pulse rounded hidden sm:block" />
                  </div>
                ))}
              </div>
            ) : productsPage?.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
                <Package className="h-8 w-8 text-muted-foreground/40" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {search ? 'Sin resultados' : 'Sin productos'}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {search
                      ? 'Ajusta la búsqueda para ver productos'
                      : 'Realiza una carga masiva para importar el catálogo'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Código</th>
                        <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Producto</th>
                        <th scope="col" className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">IVA</th>
                        <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">CUM</th>
                        <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell whitespace-nowrap">P. Caja</th>
                        <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell whitespace-nowrap">P. Unidad</th>
                        <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell whitespace-nowrap">Precio máx.</th>
                        <th scope="col" className="px-4 py-2.5" />
                      </tr>
                    </thead>
                    <tbody>
                      {productsPage!.data.map((p) => (
                        <ProductRow key={p.code} product={p} onViewRequest={setViewProduct} />
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/10">
                    <p className="text-xs text-muted-foreground tabular-nums">
                      Página {page} de {totalPages}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="h-7 w-7 rounded-md border border-input flex items-center justify-center cursor-pointer
                                   hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        aria-label="Página anterior"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="h-7 w-7 rounded-md border border-input flex items-center justify-center cursor-pointer
                                   hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        aria-label="Página siguiente"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {viewProduct && (
        <ProviderProductDetailModal product={viewProduct} onClose={() => setViewProduct(null)} />
      )}

      {showBulk && (
        <BulkUploadModal
          providerId={providerId}
          providerName={provider.name}
          onClose={() => setShowBulk(false)}
        />
      )}
    </>
  )
}
