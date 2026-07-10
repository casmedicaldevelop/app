import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { useFilingEventList } from '../hooks/useFilingEventList'
import FilingEventFiltersDrawer from './filing-event-filters-drawer'
import {
  EMPTY_FILTERS,
  countActiveFilters,
  filtersToParams,
  type FilingEventFilters,
} from '../types/filing-event-filters.types'

const PAGE_SIZE = 20

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  PENDIENTE: { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700' },
  ENTREGA_PARCIAL: { label: 'Entrega parcial', cls: 'bg-blue-100 text-blue-700' },
  ENTREGADO: { label: 'Entregado', cls: 'bg-emerald-100 text-emerald-700' },
}

function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { label: status, cls: 'bg-muted text-muted-foreground' }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span>
}

const cop = (n: number) => '$ ' + new Intl.NumberFormat('es-CO').format(n)

export default function FilingEventTable() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<FilingEventFilters>(EMPTY_FILTERS)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const activeCount = countActiveFilters(filters)
  const params = useMemo(() => ({ page, limit: PAGE_SIZE, ...filtersToParams(filters) }), [page, filters])
  const { data, isLoading } = useFilingEventList(params)

  const applyFilters = (next: FilingEventFilters) => {
    setFilters(next)
    setPage(1)
    setDrawerOpen(false)
  }

  const rows = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 0

  return (
    <section className="border-y border-border bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="text-xs text-muted-foreground">{total} {total === 1 ? 'radicación' : 'radicaciones'}</p>
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

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Autorización</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Usuario</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Nombre</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tipo de usuario</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">N° servicios</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Valor total</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">Cargando…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                {activeCount > 0 ? 'Sin resultados para el filtro.' : 'No hay radicaciones para este contrato.'}
              </td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 text-sm font-mono text-foreground">{r.authorizationCode || '—'}</td>
                  <td className="px-4 py-2.5 text-sm font-mono text-foreground">{r.userDocument}</td>
                  <td className="px-4 py-2.5 text-sm text-foreground">{r.userName || '—'}</td>
                  <td className="px-4 py-2.5 text-sm text-foreground">{r.userType ?? '—'}</td>
                  <td className="px-4 py-2.5 text-sm text-right tabular-nums text-foreground">{r.itemsCount}</td>
                  <td className="px-4 py-2.5 text-sm text-right font-mono tabular-nums text-foreground whitespace-nowrap">{cop(r.totalValue)}</td>
                  <td className="px-4 py-2.5"><StatusPill status={r.status} /></td>
                  <td className="px-4 py-2.5 text-right">
                    <button type="button" onClick={() => navigate(`/dashboard/filing-event/${r.id}`)} aria-label="Ver detalle"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-input text-muted-foreground cursor-pointer transition-colors hover:bg-muted hover:text-foreground">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-input text-muted-foreground cursor-pointer transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs tabular-nums text-muted-foreground">{page} / {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-input text-muted-foreground cursor-pointer transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <FilingEventFiltersDrawer
        open={drawerOpen}
        value={filters}
        defaultValue={EMPTY_FILTERS}
        onClose={() => setDrawerOpen(false)}
        onApply={applyFilters}
      />
    </section>
  )
}
