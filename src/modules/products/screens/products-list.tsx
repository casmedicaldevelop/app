import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Package, AlertCircle, RefreshCw, Pencil, Trash2,
  Upload, X, ChevronLeft, ChevronRight, Download, Eye, Tag,
} from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { useDeleteProduct } from '../hooks/useDeleteProduct'
import { useToggleProduct } from '../hooks/useToggleProduct'
import { useBulkUpload } from '../hooks/useBulkUpload'
import { apiConfig } from '@/config/api.config'
import { useAuthStore } from '@/modules/auth/auth.store'
import type { Product } from '../types/products.types'

const PAGE_SIZE = 20

function formatDateTime(str: string) {
  return new Date(str).toLocaleString('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
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

function ProductDetailModal({ product, onClose }: { product: Product; onClose: () => void }) {
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
        aria-labelledby="prod-detail-title"
        className="w-full max-w-md rounded-xl border border-border bg-background shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 id="prod-detail-title" className="text-sm font-semibold text-foreground">Detalle — Producto</h2>
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
          <DetailRow label="Lote" value={<span className="font-mono text-xs">{product.lot}</span>} />
          <DetailRow label="Bodega" value={product.warehouse} />
          <DetailRow
            label="CUM"
            value={product.cum
              ? <span className="font-mono text-xs">{product.cum}</span>
              : <span className="text-muted-foreground/50">—</span>
            }
          />
          <DetailRow label="Unid. por caja" value={<span className="tabular-nums">{product.box.toLocaleString('es-CO')}</span>} />
          <DetailRow label="Precio unidad" value={<span className="tabular-nums">{product.unit.toLocaleString('es-CO')}</span>} />
          <DetailRow label="Estado" value={<BoolBadge value={product.isActive} trueLabel="Activo" falseLabel="Inactivo" />} />
          <DetailRow label="Creado" value={<span className="text-xs text-muted-foreground">{formatDateTime(product.createdAt)}</span>} />
          <DetailRow label="Actualizado" value={<span className="text-xs text-muted-foreground">{formatDateTime(product.updatedAt)}</span>} />
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

function ProductRow({ product, onViewRequest, onDeleteRequest }: {
  product: Product
  onViewRequest: (p: Product) => void
  onDeleteRequest: (id: number) => void
}) {
  const navigate = useNavigate()
  const toggle = useToggleProduct(product.id)

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors duration-100">
      <td className="px-4 py-3 font-mono text-xs text-foreground whitespace-nowrap">{product.code}</td>
      <td className="px-4 py-3 text-sm text-foreground max-w-[220px]">
        <span className="truncate block" title={product.product}>{product.product}</span>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground font-mono hidden md:table-cell whitespace-nowrap">
        {product.lot}
      </td>
      <td className="px-4 py-3 text-xs text-foreground hidden lg:table-cell whitespace-nowrap">
        {product.warehouse}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground font-mono hidden xl:table-cell whitespace-nowrap">
        {product.cum ?? <span className="text-muted-foreground/50">—</span>}
      </td>
      <td className="px-4 py-3 text-xs text-foreground tabular-nums hidden md:table-cell text-right">{product.box}</td>
      <td className="px-4 py-3 text-xs text-foreground tabular-nums hidden md:table-cell text-right">{product.unit}</td>
      <td className="px-4 py-3">
        <label
          className="relative inline-flex cursor-pointer items-center"
          aria-label={toggle.isPending ? 'Guardando...' : product.isActive ? 'Desactivar producto' : 'Activar producto'}
        >
          <input
            type="checkbox"
            checked={product.isActive}
            onChange={() => toggle.mutate(!product.isActive)}
            disabled={toggle.isPending}
            className="sr-only peer"
          />
          <div className="h-5 w-9 rounded-full bg-muted-foreground/30 transition-colors duration-200
                          peer-checked:bg-primary peer-disabled:opacity-50
                          after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4
                          after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200
                          after:content-[''] peer-checked:after:translate-x-4" />
        </label>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onViewRequest(product)}
            aria-label="Ver detalle"
            className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-input text-xs
                       cursor-pointer hover:bg-muted transition-all duration-150"
          >
            <Eye className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/dashboard/products/${product.id}/edit`)}
            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-input text-xs font-medium
                       cursor-pointer hover:bg-muted transition-all duration-150"
          >
            <Pencil className="h-3 w-3" />
            <span className="hidden sm:inline">Editar</span>
          </button>
          <button
            type="button"
            onClick={() => onDeleteRequest(product.id)}
            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-destructive/40 text-destructive
                       text-xs font-medium cursor-pointer hover:bg-destructive/5 transition-all duration-150"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </td>
    </tr>
  )
}

async function downloadTemplate() {
  const { accessToken } = useAuthStore.getState()
  const res = await fetch(`${apiConfig.baseUrl}/products/bulk/template`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    credentials: 'include',
  })
  if (!res.ok) return
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'plantilla_productos.xlsx'
  a.click()
  URL.revokeObjectURL(url)
}

function BulkUploadModal({ onClose }: { onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const bulkUpload = useBulkUpload()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    bulkUpload.mutate(file, { onSuccess: () => { onClose() } })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm rounded-xl border border-border bg-background shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Carga masiva de productos</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Reemplaza todos los productos actuales</p>
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
              <Upload className="h-5 w-5 text-muted-foreground" />
              {file ? (
                <div>
                  <p className="text-xs font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
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
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={downloadTemplate}
              className="mt-2.5 w-full flex items-center justify-center gap-2 h-8 rounded-lg
                         border border-emerald-300 bg-emerald-50 text-xs font-medium
                         text-emerald-700 cursor-pointer hover:bg-emerald-100 hover:border-emerald-400
                         active:scale-[0.99] transition-all duration-150"
            >
              <Download className="h-3.5 w-3.5 shrink-0" />
              Descargar plantilla de ejemplo (.xlsx)
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={bulkUpload.isPending}
              className="flex-1 h-8 rounded-lg border border-input text-xs font-medium cursor-pointer
                         hover:bg-muted disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!file || bulkUpload.isPending}
              className="flex-1 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-semibold
                         cursor-pointer hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98]
                         transition-all duration-200 shadow-sm"
            >
              {bulkUpload.isPending ? 'Procesando...' : 'Cargar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ id, code, onClose, onConfirm, isPending }: {
  id: number
  code: string
  onClose: () => void
  onConfirm: () => void
  isPending: boolean
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !isPending) onClose() }}
    >
      <div className="w-full max-w-xs rounded-xl border border-border bg-background shadow-xl">
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Eliminar producto</h2>
          <p className="mt-1.5 text-xs text-muted-foreground">
            ¿Confirmas eliminar el producto{' '}
            <span className="font-mono font-medium text-foreground">{code}</span>{' '}
            <span className="text-muted-foreground/60">(#{id})</span>?
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="flex gap-2 px-5 pb-4">
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
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 h-8 rounded-lg bg-destructive text-white text-xs font-semibold
                       cursor-pointer hover:bg-destructive/90 disabled:opacity-50 transition-all duration-200"
          >
            {isPending ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProductsListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)
  const [showBulk, setShowBulk] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; code: string } | null>(null)
  const [viewProduct, setViewProduct] = useState<Product | null>(null)

  const isActiveParam =
    statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined

  const { data, isLoading, isError, refetch } = useProducts({
    page,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
    isActive: isActiveParam,
  })

  const deleteMutation = useDeleteProduct()

  const products = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">

        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h1 className="text-base font-semibold text-foreground">Productos</h1>
            {!isLoading && !isError && (
              <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                {total} producto{total !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/dashboard/products/cum-matching/provider1')}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-amber-300 bg-amber-50
                         text-xs font-medium text-amber-700 cursor-pointer hover:bg-amber-100
                         hover:border-amber-400 transition-all duration-150"
            >
              <Tag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Asignar CUM (DIS)</span>
            </button>
            <button
              type="button"
              onClick={() => setShowBulk(true)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-input text-xs font-medium
                         cursor-pointer hover:bg-muted transition-all duration-150"
            >
              <Upload className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Carga masiva</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/products/new')}
              className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-primary text-xs font-semibold
                         text-primary-foreground cursor-pointer hover:bg-primary/90 active:scale-[0.98]
                         transition-all duration-200 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nuevo producto</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-2.5 border-b border-border bg-muted/20">
          <input
            type="text"
            placeholder="Buscar por código, nombre, lote o bodega..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="h-7 min-w-0 flex-1 rounded-md border border-input bg-background px-2.5 text-xs
                       placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none
                       focus:ring-1 focus:ring-primary/30 transition-colors"
          />
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="prod-status-filter" className="text-xs text-muted-foreground whitespace-nowrap">
              Estado:
            </label>
            <select
              id="prod-status-filter"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1) }}
              className="h-7 rounded-md border border-input bg-background px-2.5 text-xs cursor-pointer
                         hover:border-ring/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30
                         transition-colors"
            >
              <option value="all">Todos</option>
              <option value="active">Solo activos</option>
              <option value="inactive">Solo inactivos</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                <div className="h-3 flex-1 bg-muted animate-pulse rounded" />
                <div className="h-3 w-16 bg-muted animate-pulse rounded hidden md:block" />
                <div className="h-3 w-20 bg-muted animate-pulse rounded hidden lg:block" />
                <div className="h-3 w-16 bg-muted animate-pulse rounded hidden xl:block" />
                <div className="h-3 w-8 bg-muted animate-pulse rounded hidden md:block" />
                <div className="h-3 w-8 bg-muted animate-pulse rounded hidden md:block" />
                <div className="h-5 w-9 bg-muted animate-pulse rounded-full" />
                <div className="h-7 w-20 bg-muted animate-pulse rounded-md" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
            <AlertCircle className="h-8 w-8 text-destructive/60" />
            <div>
              <p className="text-sm font-medium text-foreground">Error al cargar productos</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Verifica tu conexión e inténtalo de nuevo</p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-input text-xs font-medium
                         cursor-pointer hover:bg-muted transition-all duration-150"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reintentar
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
            <Package className="h-8 w-8 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {search || statusFilter !== 'all' ? 'Sin resultados' : 'Sin productos'}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {search || statusFilter !== 'all'
                  ? 'Ajusta los filtros para ver productos'
                  : 'Agrega el primer producto o realiza una carga masiva'}
              </p>
            </div>
            {!search && statusFilter === 'all' && (
              <button
                type="button"
                onClick={() => navigate('/dashboard/products/new')}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground
                           text-xs font-semibold cursor-pointer hover:bg-primary/90 transition-all duration-150"
              >
                <Plus className="h-3.5 w-3.5" />
                Crear primer producto
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Código</th>
                    <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Producto</th>
                    <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Lote</th>
                    <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Bodega</th>
                    <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden xl:table-cell">CUM</th>
                    <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Cajas</th>
                    <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Unidades</th>
                    <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activo</th>
                    <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground" />
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      onViewRequest={setViewProduct}
                      onDeleteRequest={(id) => setDeleteTarget({ id, code: product.code })}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
      </div>

      {viewProduct && <ProductDetailModal product={viewProduct} onClose={() => setViewProduct(null)} />}

      {showBulk && <BulkUploadModal onClose={() => setShowBulk(false)} />}

      {deleteTarget && (
        <DeleteConfirmModal
          id={deleteTarget.id}
          code={deleteTarget.code}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          isPending={deleteMutation.isPending}
        />
      )}
    </>
  )
}
