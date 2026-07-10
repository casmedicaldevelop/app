import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ChevronLeft, ChevronRight, ClipboardList, Download, Eye, RefreshCw, ScanLine, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { useFilings } from '../hooks/use-filings'
import { filingMipresService } from '../services/filing-mipres.service'
import FilingFiltersDrawer from '../components/filing-filters-drawer'
import FilingSummaryBar from '../components/filing-summary-bar'
import {
  EMPTY_FILTERS,
  countActiveFilters,
  filtersToParams,
  type FilingFilters,
  type Filing,
} from '../types/filing-mipres.types'

const PAGE_SIZE = 20

/** Filtro por defecto: rango del año en curso (01-ene a 31-dic), aplicado al entrar. */
function buildDefaultFilters(): FilingFilters {
  const y = new Date().getFullYear()
  return { ...EMPTY_FILTERS, dateMode: 'rango', dateFrom: `${y}-01-01`, dateTo: `${y}-12-31` }
}

const STATUS_STYLES: Record<string, { wrap: string; dot: string }> = {
  PENDIENTE: { wrap: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  ENTREGADO: { wrap: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  ENTREGA_PARCIAL: { wrap: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
}

function StatusPill({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? { wrap: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground/60' }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${style.wrap}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
      {status}
    </span>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function FilingMipresListPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<FilingFilters>(buildDefaultFilters)
  const defaultFilters = useMemo(buildDefaultFilters, [])
  const [page, setPage] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [scanValue, setScanValue] = useState('')
  const [scanning, setScanning] = useState(false)
  const scanInputRef = useRef<HTMLInputElement>(null)

  // Al entrar al módulo, el foco se ubica en el lector de código de barras.
  useEffect(() => {
    scanInputRef.current?.focus()
  }, [])

  const activeCount = countActiveFilters(filters)
  const params = useMemo(
    () => ({ page, limit: PAGE_SIZE, ...filtersToParams(filters) }),
    [page, filters],
  )

  const { data, isLoading, isError, refetch } = useFilings(params)

  const rows: Filing[] = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  const applyFilters = (next: FilingFilters) => {
    setFilters(next)
    setPage(1)
    setDrawerOpen(false)
  }

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const blob = await filingMipresService.exportExcel(filtersToParams(filters))
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'registros-mipres.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('No se pudo exportar el Excel')
    } finally {
      setExporting(false)
    }
  }

  // Lector de código de barras: el código es el IDProgramación (schedule_id).
  // Si existe el radicado, navega a su detalle; si no, notifica con sonner.
  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = scanValue.trim()
    if (!code || scanning) return
    setScanning(true)
    try {
      const { id } = await filingMipresService.findIdBySchedule(code)
      setScanValue('')
      navigate(`/dashboard/filing-mipres/${id}`)
    } catch {
      toast.error(`No existe un registro con el código ${code}`)
      setScanValue('')
      scanInputRef.current?.focus()
    } finally {
      setScanning(false)
    }
  }

  return (
    <>
      <div className="flex min-h-full flex-col bg-background md:h-full">
        {/* Header del módulo (full-width) */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-6 py-4">
          <div>
            <h1 className="text-base font-semibold text-foreground">#Registros</h1>
            {!isLoading && !isError && (
              <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                {total} radicaci{total !== 1 ? 'ones' : 'ón'}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <form onSubmit={handleScan} className="shrink-0">
              <div className="relative">
                <ScanLine className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={scanInputRef}
                  type="text"
                  value={scanValue}
                  onChange={(e) => setScanValue(e.target.value)}
                  placeholder="Escanear código (IDProgramación)"
                  disabled={scanning}
                  className="h-8 w-60 rounded-lg border border-input pl-8 pr-3 text-xs font-medium focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/20 disabled:opacity-50"
                />
              </div>
            </form>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-input px-3 text-xs font-medium transition-all duration-150 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {exporting ? 'Exportando…' : 'Exportar Excel'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="relative flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-input px-3 text-xs font-medium transition-all duration-150 hover:bg-muted"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filtros</span>
              {activeCount > 0 && (
                <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground tabular-nums">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Contadores */}
        {isLoading ? (
          <div className="shrink-0 space-y-5 border-b border-border p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
            <div className="h-20 animate-pulse rounded-xl bg-muted" />
          </div>
        ) : data?.summary ? (
          <div className="shrink-0">
            <FilingSummaryBar summary={data.summary} />
          </div>
        ) : null}

        {/* Content: en mobile fluye y scrollea toda la página; en desktop scroll de panel */}
        <div className="overflow-x-auto md:flex-1 md:overflow-auto">
          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  <div className="hidden h-3 flex-1 animate-pulse rounded bg-muted sm:block" />
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
                  <div className="hidden h-3 w-28 animate-pulse rounded bg-muted sm:block" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-14 text-center">
              <AlertCircle className="h-8 w-8 text-destructive/60" />
              <div>
                <p className="text-sm font-medium text-foreground">Error al cargar radicaciones</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Verificá tu conexión e intentá de nuevo
                </p>
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-input px-3 text-xs font-medium transition-all duration-150 hover:bg-muted"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reintentar
              </button>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-14 text-center">
              <ClipboardList className="h-8 w-8 text-muted-foreground/40" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {activeCount > 0 ? 'Sin resultados' : 'Sin radicaciones'}
                </p>
                <p className="mt-0.5 max-w-md text-xs text-muted-foreground">
                  {activeCount > 0
                    ? 'Ajustá los filtros para ver radicaciones'
                    : 'Las radicaciones aparecen acá cuando se hace un amarre en MIPRES'}
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-muted/40">
                  <th scope="col" className="border border-border px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    Fecha
                  </th>
                  <th scope="col" className="border border-border px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    Usuario
                  </th>
                  <th scope="col" className="border border-border px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                    Prescripción
                  </th>
                  <th scope="col" className="border border-border px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell whitespace-nowrap">
                    Tec
                  </th>
                  <th scope="col" className="border border-border px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Medicamento
                  </th>
                  <th scope="col" className="border border-border px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                    Cant
                  </th>
                  <th scope="col" className="border border-border px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                    Entr
                  </th>
                  <th scope="col" className="border border-border px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Estado
                  </th>
                  <th scope="col" className="border border-border px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-muted/20">
                    <td className="border border-border px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="border border-border px-4 py-3 font-mono text-foreground">
                      {r.userDocument}
                    </td>
                    <td
                      className="border border-border px-4 py-3 font-mono text-foreground max-w-[180px] truncate hidden lg:table-cell"
                      title={r.prescriptionNumber}
                    >
                      {r.prescriptionNumber}
                    </td>
                    <td className="border border-border px-4 py-3 font-mono text-foreground hidden md:table-cell">
                      {r.technologyCode}
                    </td>
                    <td
                      className="border border-border px-4 py-3 text-foreground max-w-[220px] truncate"
                      title={r.medicationName}
                    >
                      {r.medicationName}
                    </td>
                    <td className="border border-border px-4 py-3 text-right text-foreground tabular-nums hidden sm:table-cell">
                      {r.quantityToDeliver}
                    </td>
                    <td className="border border-border px-4 py-3 text-right text-foreground tabular-nums hidden sm:table-cell">
                      {r.quantityDelivered}
                    </td>
                    <td className="border border-border px-4 py-3">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="border border-border px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/dashboard/filing-mipres/${r.id}`)}
                        aria-label="Ver completo"
                        title="Ver completo"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer paginación (fijo) */}
        {!isLoading && !isError && rows.length > 0 && totalPages > 1 && (
          <div className="flex shrink-0 items-center justify-between border-t border-border bg-muted/10 px-6 py-3">
            <p className="text-xs text-muted-foreground tabular-nums">
              Página {page} de {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Página anterior"
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-input transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Página siguiente"
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-input transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <FilingFiltersDrawer
        open={drawerOpen}
        value={filters}
        defaultValue={defaultFilters}
        onClose={() => setDrawerOpen(false)}
        onApply={applyFilters}
      />
    </>
  )
}
