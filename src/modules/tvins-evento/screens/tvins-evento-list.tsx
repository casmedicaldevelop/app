import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle, RefreshCw, Upload, X, Eye,
  ChevronLeft, ChevronRight, Download, Database, ArrowLeft, SlidersHorizontal,
} from 'lucide-react'
import TvEventoRowModal from '../../tvmed-evento/components/tv-evento-row-modal'
import {
  useTvInsEventoList,
  useBulkUploadTvInsEvento,
  useUpdatePreviewTvInsEvento,
  useUpdateApplyTvInsEvento,
} from '../hooks/useTvInsEvento'
import { useActiveEventContract } from '@/modules/evento/hooks/useEventContract'
import TvInsEventoFiltersDrawer from '../components/tvins-evento-filters-drawer'
import { apiConfig } from '@/config/api.config'
import { useAuthStore } from '@/modules/auth/auth.store'
import {
  EMPTY_EVENTO_FILTERS,
  countActiveEventoFilters,
  eventoFiltersToParams,
  type EventoFilters,
  type TvInsEvento,
  type UpdateMissing,
} from '../types/tvins-evento.types'

const PAGE_SIZE = 20
const TABLE = 'tvins_evento'
const LOCK_MSG = 'El contrato en curso está cerrado'

const copFormatter = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })
function fmtCop(value: number): string {
  return `$ ${copFormatter.format(value)}`
}

async function downloadUpdateTemplate() {
  const { accessToken } = useAuthStore.getState()
  const res = await fetch(`${apiConfig.baseUrl}/tvins-evento/update/template`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    credentials: 'include',
  })
  if (!res.ok) return
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `plantilla_actualizacion_${TABLE}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

async function downloadMissing(rows: UpdateMissing[]) {
  const { accessToken } = useAuthStore.getState()
  const res = await fetch(`${apiConfig.baseUrl}/tvins-evento/update/missing-template`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
    body: JSON.stringify({ rows }),
    credentials: 'include',
  })
  if (!res.ok) return
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `faltantes_${TABLE}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

type BulkRowError = { row: number; column: string; reason: string }
type BulkError = { message?: string; errors?: BulkRowError[]; truncated?: number }

/** Carga masiva de FALTANTES (insert-only). Solo se abre tras una actualización con faltantes. */
function BulkUploadModal({ onClose, onUploaded }: { onClose: () => void; onUploaded: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const bulkUpload = useBulkUploadTvInsEvento()
  const err = bulkUpload.error as BulkError | null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    bulkUpload.mutate(file, { onSuccess: () => { onUploaded(); onClose() } })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-sm rounded-xl border border-border bg-background shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Cargar faltantes — <span className="font-mono">{TABLE}</span></h2>
            <p className="text-xs text-muted-foreground mt-0.5">Agrega los registros del archivo (no reemplaza la tabla)</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar"
            className="h-7 w-7 rounded-md flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Archivo de faltantes</label>
            <div onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input px-4 py-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all duration-150">
              <Upload className="h-5 w-5 text-muted-foreground" />
              {file ? (
                <div>
                  <p className="text-xs font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-medium text-foreground">Seleccionar archivo</p>
                  <p className="text-xs text-muted-foreground">.xlsx, .xls — el Excel de faltantes completado</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          {bulkUpload.isError && (
            <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2.5">
              <p className="text-xs font-medium text-destructive">{err?.message ?? 'No se pudo procesar el archivo'}</p>
              {err?.errors?.length ? (
                <ul className="mt-2 max-h-44 space-y-1 overflow-y-auto">
                  {err.errors.map((e, i) => (
                    <li key={i} className="text-xs leading-snug text-destructive/90">
                      Fila {e.row}, columna <span className="font-mono">{e.column}</span>: {e.reason}
                    </li>
                  ))}
                  {err.truncated ? (
                    <li className="text-xs text-muted-foreground">… y {err.truncated} error(es) más</li>
                  ) : null}
                </ul>
              ) : null}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} disabled={bulkUpload.isPending}
              className="flex-1 h-8 rounded-lg border border-input text-xs font-medium cursor-pointer hover:bg-muted disabled:opacity-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={!file || bulkUpload.isPending}
              className="flex-1 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-semibold cursor-pointer hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98] transition-all duration-200 shadow-sm">
              {bulkUpload.isPending ? 'Procesando...' : 'Cargar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function UpdateModal({ onClose, onMissing }: { onClose: () => void; onMissing: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [choices, setChoices] = useState<Record<number, number>>({})
  const preview = useUpdatePreviewTvInsEvento()
  const apply = useUpdateApplyTvInsEvento()
  const data = preview.data
  const applied = apply.data
  const previewErr = preview.error as { message?: string } | null

  const hasFormatErrors = (data?.errors.length ?? 0) > 0
  const allResolved = !data || data.conflicts.every((c) => choices[c.row] != null)
  const targets = data ? data.directs.length + data.conflicts.length : 0
  const canApply = !!data && !hasFormatErrors && allResolved && targets > 0

  function analyze(e: React.FormEvent) {
    e.preventDefault()
    if (file) preview.mutate(file, { onSuccess: () => setChoices({}) })
  }
  function doApply() {
    if (!data) return
    const items = [
      ...data.directs.map((d) => ({ id: d.target.id, value: d.value })),
      ...data.conflicts.map((c) => ({ id: choices[c.row], value: c.value })),
    ]
    apply.mutate(items, {
      onSuccess: () => {
        // Si la actualización dejó CUM faltantes, se habilita la carga masiva de esos faltantes.
        if (data.missing.length > 0) onMissing()
      },
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-lg rounded-xl border border-border bg-background shadow-xl max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Actualización por archivo — <span className="font-mono">{TABLE}</span></h2>
            <p className="text-xs text-muted-foreground mt-0.5">Actualiza el valor buscando por CUM</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar"
            className="h-7 w-7 rounded-md flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto">
          {applied ? (
            <div className="space-y-3">
              <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                <p className="text-xs text-emerald-700">Se actualizaron {applied.updated} registro(s).</p>
              </div>
              {data && data.missing.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <p className="text-xs text-amber-700 leading-snug">
                    {data.missing.length} CUM no existían y no se actualizaron. Descarga el Excel prellenado, complétalo y súbelo por carga masiva.
                  </p>
                  <button type="button" onClick={() => downloadMissing(data.missing)}
                    className="mt-2 inline-flex items-center gap-2 h-8 px-3 rounded-lg border border-amber-300 bg-white text-xs font-medium text-amber-700 cursor-pointer hover:bg-amber-100 transition-colors">
                    <Download className="h-3.5 w-3.5" /> Descargar Excel de faltantes
                  </button>
                </div>
              )}
              <button type="button" onClick={onClose}
                className="w-full h-8 rounded-lg border border-input text-xs font-medium cursor-pointer hover:bg-muted transition-colors">
                Cerrar
              </button>
            </div>
          ) : !data ? (
            <form onSubmit={analyze} className="space-y-4">
              <div onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input px-4 py-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all duration-150">
                <Upload className="h-5 w-5 text-muted-foreground" />
                {file ? (
                  <div><p className="text-xs font-medium text-foreground">{file.name}</p><p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p></div>
                ) : (
                  <div><p className="text-xs font-medium text-foreground">Seleccionar archivo</p><p className="text-xs text-muted-foreground">.xlsx, .xls, .csv — columnas: cum, nombre, valor</p></div>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              <button type="button" onClick={downloadUpdateTemplate}
                className="w-full flex items-center justify-center gap-2 h-8 rounded-lg border border-emerald-300 bg-emerald-50 text-xs font-medium text-emerald-700 cursor-pointer hover:bg-emerald-100 hover:border-emerald-400 transition-all duration-150">
                <Download className="h-3.5 w-3.5" /> Descargar plantilla (.xlsx)
              </button>
              {preview.isError && (
                <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2.5">
                  <p className="text-xs text-destructive">{previewErr?.message ?? 'No se pudo analizar el archivo'}</p>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={onClose} className="flex-1 h-8 rounded-lg border border-input text-xs font-medium cursor-pointer hover:bg-muted transition-colors">Cancelar</button>
                <button type="submit" disabled={!file || preview.isPending}
                  className="flex-1 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-semibold cursor-pointer hover:bg-primary/90 disabled:opacity-50 transition-all duration-200 shadow-sm">
                  {preview.isPending ? 'Analizando...' : 'Analizar'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {hasFormatErrors && (
                <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2.5">
                  <p className="text-xs font-medium text-destructive">El archivo tiene {data.errors.length} error(es) de formato. Corrígelos y vuelve a analizar.</p>
                  <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto">
                    {data.errors.map((e, i) => (
                      <li key={i} className="text-xs leading-snug text-destructive/90">Fila {e.row}, columna <span className="font-mono">{e.column}</span>: {e.reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {data.directs.length} se actualizarán directo · {data.conflicts.length} requieren elección · {data.missing.length} no existen
              </p>

              {data.conflicts.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-foreground">CUM con varios registros — elige cuál actualizar:</p>
                  {data.conflicts.map((c) => (
                    <div key={c.row} className="rounded-lg border border-border p-3">
                      <p className="mb-2 text-xs text-muted-foreground">
                        CUM <span className="font-mono text-foreground">{c.cum}</span> → nuevo valor <span className="font-semibold text-foreground tabular-nums">{c.value}</span>
                      </p>
                      <div className="space-y-1.5">
                        {c.candidates.map((cand) => (
                          <label key={cand.id}
                            className={`flex items-start gap-2 rounded-md border px-2.5 py-2 cursor-pointer transition-colors ${choices[c.row] === cand.id ? 'border-primary bg-primary/5' : 'border-input hover:bg-muted/40'}`}>
                            <input type="radio" name={`conf-${c.row}`} checked={choices[c.row] === cand.id}
                              onChange={() => setChoices((p) => ({ ...p, [c.row]: cand.id }))} className="mt-0.5 cursor-pointer" />
                            <span className="text-xs text-foreground">
                              <span className="font-medium">{cand.name}</span>
                              <span className="text-muted-foreground"> · {cand.concentration} · {cand.presentation} · valor actual {cand.value}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {apply.isError && (
                <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2.5">
                  <p className="text-xs text-destructive">{(apply.error as { message?: string })?.message ?? 'No se pudo aplicar la actualización'}</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={onClose} className="flex-1 h-8 rounded-lg border border-input text-xs font-medium cursor-pointer hover:bg-muted transition-colors">Cancelar</button>
                <button type="button" onClick={doApply} disabled={!canApply || apply.isPending}
                  className="flex-1 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-semibold cursor-pointer hover:bg-primary/90 disabled:opacity-50 transition-all duration-200 shadow-sm">
                  {apply.isPending ? 'Aplicando...' : `Aplicar (${targets})`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


const TH = 'px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap'

export default function TvInsEventoListPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<EventoFilters>(EMPTY_EVENTO_FILTERS)
  const [page, setPage] = useState(1)
  const [showUpdate, setShowUpdate] = useState(false)
  // La carga masiva solo está disponible tras una actualización que dejó faltantes (estado de sesión).
  const [bulkAvailable, setBulkAvailable] = useState(false)
  const [showBulk, setShowBulk] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [viewRow, setViewRow] = useState<TvInsEvento | null>(null)

  const activeFilters = countActiveEventoFilters(filters)
  const { data, isLoading, isError, refetch } = useTvInsEventoList({
    page,
    limit: PAGE_SIZE,
    ...eventoFiltersToParams(filters),
  })

  // Si hay un contrato EN CURSO y está cerrado, se bloquean carga masiva, actualización y nuevo.
  const { data: activeContract } = useActiveEventContract()
  const locked = !!activeContract && !activeContract.isOpen

  const records = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  return (
    <>
      <div className="border-y border-border bg-background overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <button type="button" onClick={() => navigate('/dashboard/tv-data')} aria-label="Volver" title="Volver"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-input text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="font-mono text-base font-semibold text-foreground truncate">{TABLE}</h1>
              {!isLoading && !isError && (
                <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                  {total} registro{total !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-input text-xs font-medium cursor-pointer hover:bg-muted transition-all duration-150">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filtros</span>
              {activeFilters > 0 && (
                <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{activeFilters}</span>
              )}
            </button>
            <button type="button" onClick={() => setShowUpdate(true)} disabled={locked}
              title={locked ? LOCK_MSG : undefined}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-input text-xs font-medium cursor-pointer hover:bg-muted transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent">
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Actualización</span>
            </button>
            {bulkAvailable && !locked && (
              <button type="button" onClick={() => setShowBulk(true)}
                className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-primary text-xs font-semibold text-primary-foreground cursor-pointer hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-sm">
                <Upload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Carga masiva</span>
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
            <button type="button" onClick={() => refetch()}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-input text-xs font-medium cursor-pointer hover:bg-muted transition-all duration-150">
              <RefreshCw className="h-3.5 w-3.5" />
              Reintentar
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
            <Database className="h-8 w-8 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium text-foreground">{activeFilters > 0 ? 'Sin resultados' : 'Sin registros'}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {activeFilters > 0 ? 'Ajusta los filtros para ver registros' : 'Los registros se cargan mediante Actualización'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[760px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th scope="col" className={`${TH} w-12`}>ID</th>
                    <th scope="col" className={TH}>CUM</th>
                    <th scope="col" className={TH}>Nombre</th>
                    <th scope="col" className={TH}>Concentración</th>
                    <th scope="col" className={TH}>U. dispensación</th>
                    <th scope="col" className={`${TH} text-right`}>Valor</th>
                    <th scope="col" className={TH}></th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors duration-100">
                      <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">{r.id}</td>
                      <td className="px-4 py-3 text-xs font-mono text-foreground whitespace-nowrap">{r.cum}</td>
                      <td className="px-4 py-3 text-sm text-foreground max-w-[320px]"><span className="truncate block" title={r.name}>{r.name}</span></td>
                      <td className="px-4 py-3 text-xs text-foreground whitespace-nowrap">{r.concentration}</td>
                      <td className="px-4 py-3 text-xs text-foreground whitespace-nowrap">{r.dispensingUnitRef?.description ?? r.dispensingUnit}</td>
                      <td className="px-4 py-3 text-right text-xs font-mono tabular-nums text-foreground whitespace-nowrap">{fmtCop(r.value)}</td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" onClick={() => setViewRow(r)} aria-label="Ver detalle" title="Ver detalle"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input text-muted-foreground cursor-pointer transition-colors hover:bg-muted hover:text-foreground">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/10">
                <p className="text-xs text-muted-foreground tabular-nums">Página {page} de {totalPages}</p>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Página anterior"
                    className="h-7 w-7 rounded-md border border-input flex items-center justify-center cursor-pointer hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Página siguiente"
                    className="h-7 w-7 rounded-md border border-input flex items-center justify-center cursor-pointer hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showUpdate && (
        <UpdateModal onClose={() => setShowUpdate(false)} onMissing={() => setBulkAvailable(true)} />
      )}

      {showBulk && (
        <BulkUploadModal onClose={() => setShowBulk(false)} onUploaded={() => setBulkAvailable(false)} />
      )}

      <TvInsEventoFiltersDrawer
        open={filtersOpen}
        value={filters}
        onClose={() => setFiltersOpen(false)}
        onApply={(f) => { setFilters(f); setPage(1); setFiltersOpen(false) }}
      />

      {viewRow && <TvEventoRowModal row={viewRow} table={TABLE} onClose={() => setViewRow(null)} />}
    </>
  )
}
