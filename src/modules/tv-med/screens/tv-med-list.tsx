import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, AlertCircle, RefreshCw, Pencil, Trash2,
  Upload, X, ChevronLeft, ChevronRight, Download, Database,
} from 'lucide-react'
import { useTvMedList } from '../hooks/useTvMedList'
import { useDeleteTvMed } from '../hooks/useDeleteTvMed'
import { useBulkUploadTvMed } from '../hooks/useBulkUploadTvMed'
import { apiConfig } from '@/config/api.config'
import { useAuthStore } from '@/modules/auth/auth.store'

const PAGE_SIZE = 20

async function downloadTemplate() {
  const { accessToken } = useAuthStore.getState()
  const res = await fetch(`${apiConfig.baseUrl}/tv-med/bulk/template`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    credentials: 'include',
  })
  if (!res.ok) return
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'plantilla_tvmed.xlsx'
  a.click()
  URL.revokeObjectURL(url)
}

function BulkUploadModal({ onClose }: { onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const bulkUpload = useBulkUploadTvMed()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    bulkUpload.mutate(file, { onSuccess: () => onClose() })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm rounded-xl border border-border bg-background shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Carga masiva — TvMed</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Reemplaza toda la tabla con los datos del archivo</p>
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
          <div role="alert" className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-snug">
              Esta operación eliminará todos los registros actuales y los reemplazará con los datos del archivo.
            </p>
          </div>

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
                  <p className="text-xs text-muted-foreground">.xlsx, .xls — máx. 10 MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
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

function DeleteConfirmModal({ id, onClose, onConfirm, isPending }: {
  id: number
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
          <h2 className="text-sm font-semibold text-foreground">Eliminar registro</h2>
          <p className="mt-1.5 text-xs text-muted-foreground">
            ¿Confirmas eliminar el registro{' '}
            <span className="font-mono font-medium text-foreground">#{id}</span>?
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

export default function TvMedListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showBulk, setShowBulk] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading, isError, refetch } = useTvMedList({
    page,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
  })

  const deleteMutation = useDeleteTvMed()

  const records = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  function handleDeleteConfirm() {
    if (deleteId === null) return
    deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) })
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h1 className="text-base font-semibold text-foreground">TvMed</h1>
            {!isLoading && !isError && (
              <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                {total} registro{total !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
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
              onClick={() => navigate('/dashboard/tv-med/new')}
              className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-primary text-xs font-semibold
                         text-primary-foreground cursor-pointer hover:bg-primary/90 active:scale-[0.98]
                         transition-all duration-200 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nuevo</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-2.5 border-b border-border bg-muted/20">
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className={`h-7 w-full rounded-md border border-input bg-background px-2.5 text-xs
                         placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none
                         focus:ring-1 focus:ring-primary/30 transition-colors${search ? ' pr-7' : ''}`}
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setPage(1) }}
                aria-label="Limpiar búsqueda"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center
                           justify-center rounded text-muted-foreground hover:text-foreground
                           cursor-pointer transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="h-3 w-8 bg-muted animate-pulse rounded" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                <div className="h-3 flex-1 bg-muted animate-pulse rounded" />
                <div className="h-7 w-20 bg-muted animate-pulse rounded-md" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
            <AlertCircle className="h-8 w-8 text-destructive/60" />
            <div>
              <p className="text-sm font-medium text-foreground">Error al cargar los registros</p>
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
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
            <Database className="h-8 w-8 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {search ? 'Sin resultados' : 'Sin registros'}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {search
                  ? 'Ajusta la búsqueda para ver registros'
                  : 'Agrega el primer registro o realiza una carga masiva'}
              </p>
            </div>
            {!search && (
              <button
                type="button"
                onClick={() => navigate('/dashboard/tv-med/new')}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground
                           text-xs font-semibold cursor-pointer hover:bg-primary/90 transition-all duration-150"
              >
                <Plus className="h-3.5 w-3.5" />
                Crear primer registro
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground w-16">#</th>
                    <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground w-40">Código</th>
                    <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nombre</th>
                    <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground" />
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors duration-100"
                    >
                      <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">{record.id}</td>
                      <td className="px-4 py-3 text-xs font-mono text-foreground">{record.code}</td>
                      <td className="px-4 py-3 text-sm text-foreground max-w-[300px]">
                        <span className="truncate block" title={record.name}>{record.name}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/dashboard/tv-med/${record.id}/edit`)}
                            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-input text-xs font-medium
                                       cursor-pointer hover:bg-muted transition-all duration-150"
                          >
                            <Pencil className="h-3 w-3" />
                            <span className="hidden sm:inline">Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(record.id)}
                            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-destructive/40 text-destructive
                                       text-xs font-medium cursor-pointer hover:bg-destructive/5 transition-all duration-150"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
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
      </div>

      {showBulk && <BulkUploadModal onClose={() => setShowBulk(false)} />}

      {deleteId !== null && (
        <DeleteConfirmModal
          id={deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
          isPending={deleteMutation.isPending}
        />
      )}
    </>
  )
}
