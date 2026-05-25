import { useMemo, useState } from 'react'
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Code2,
  HelpCircle,
  Inbox,
  XCircle,
} from 'lucide-react'
import type { ScheduleItem } from '../types/schedules.types'
import { isScheduleActive, scheduleStatus, type ScheduleStatus } from '../utils/schedules.utils'
import TvMedProductsModal from '../../../components/tv-med-products-modal'
import ConfirmCancelScheduleModal from './confirm-cancel-schedule-modal'
import RequestDebugModal from '../../../components/request-debug-modal'
import { SCHEDULES_DEBUG_KEYS } from '../services/schedules.service'
import { useRequestMeta } from '../../../../../lib/request-log'

interface SchedulesPanelProps {
  items: ScheduleItem[]
  loading: boolean
  error: string | null
  onCancel: (item: ScheduleItem) => Promise<void> | void
  cancelingIds: Set<number>
  pendingBindCount?: number
}

type SortKey = 'status' | 'scheduledAt' | 'scheduleId' | 'product' | 'quantity' | 'maxDeliveryDate'
type SortDir = 'asc' | 'desc'

function fmtDateTime(iso: string | null): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return iso
  }
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function SchedulesPanel({
  items,
  loading,
  error,
  onCancel,
  cancelingIds,
  pendingBindCount = 0,
}: SchedulesPanelProps) {
  const [sortKey, setSortKey] = useState<SortKey>('scheduledAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [showTvMedFor, setShowTvMedFor] = useState<string | null>(null)
  const [confirmFor, setConfirmFor] = useState<ScheduleItem | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const loadSchedulesMeta = useRequestMeta(SCHEDULES_DEBUG_KEYS.load)

  const sorted = useMemo(() => {
    const copy = [...items]
    copy.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortKey) {
        case 'status': {
          const av = isScheduleActive(a) ? 0 : 1
          const bv = isScheduleActive(b) ? 0 : 1
          return (av - bv) * dir
        }
        case 'scheduleId':
          return (a.IDProgramacion - b.IDProgramacion) * dir
        case 'quantity':
          return (Number(a.CantTotAEntregar) - Number(b.CantTotAEntregar)) * dir
        case 'product':
          return a.CodSerTecAEntregar.localeCompare(b.CodSerTecAEntregar) * dir
        case 'maxDeliveryDate':
          return a.FecMaxEnt.localeCompare(b.FecMaxEnt) * dir
        case 'scheduledAt':
        default:
          return a.FecProgramacion.localeCompare(b.FecProgramacion) * dir
      }
    })
    return copy
  }, [items, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'scheduledAt' || key === 'maxDeliveryDate' || key === 'scheduleId' ? 'desc' : 'asc')
    }
  }

  const handleToggleExpand = (id: number) => {
    setExpanded((prev) => (prev === id ? null : id))
  }

  const body = loading ? (
    <LoadingSkeleton />
  ) : error ? (
    <ErrorState message={error} />
  ) : items.length === 0 && pendingBindCount === 0 ? (
    <EmptyState />
  ) : null

  return (
    <>
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Programaciones</h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Programaciones SISPRO de esta prescripción.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowDebug(true)}
          aria-label="Ver request/response de la petición que trae las programaciones"
          title="Ver request/response"
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-600 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          <Code2 className="h-3.5 w-3.5" />
          Ver request
        </button>
      </header>

      {body}

      {body == null && (
        <>
      {/* < xl (under 1280px): card layout — no horizontal scroll, no sticky.
          Same shape as routings-panel for visual consistency. */}
      <div className="flex flex-col gap-2.5 xl:hidden">
        {Array.from({ length: pendingBindCount }).map((_, i) => (
          <PendingBindSkeletonCard key={`skeleton-card-${i}`} />
        ))}
        {sorted.map((item) => (
          <ScheduleCard
            key={item.IDProgramacion}
            item={item}
            isOpen={expanded === item.IDProgramacion}
            canceling={cancelingIds.has(item.IDProgramacion)}
            onToggleExpand={() => handleToggleExpand(item.IDProgramacion)}
            onAskTvMed={() => setShowTvMedFor(item.CodSerTecAEntregar)}
            onAskCancel={() => setConfirmFor(item)}
          />
        ))}
      </div>

      {/* xl+ (≥1280px): dense table — column widths sum < available main width
          so no horizontal scroll, no sticky needed. */}
      <div className="hidden xl:block overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <Th label="Estado" k="status" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} width="w-24" />
              <Th label="Fec. Programación" k="scheduledAt" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} width="w-36" />
              <Th label="IDProgramacion" k="scheduleId" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} width="w-28" />
              <Th label="Producto" k="product" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} width="w-32" />
              <Th label="Cant." k="quantity" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} width="w-16" align="right" />
              <Th label="Fec. Máx Entrega" k="maxDeliveryDate" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} width="w-28" />
              <th className="w-24 px-3 py-2.5"></th>
              <th className="w-8 px-2 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: pendingBindCount }).map((_, i) => (
              <PendingBindSkeletonRow key={`skeleton-row-${i}`} />
            ))}
            {sorted.map((item) => {
              const status = scheduleStatus(item)
              const isOpen = expanded === item.IDProgramacion
              const canceling = cancelingIds.has(item.IDProgramacion)
              return (
                <FragmentRow
                  key={item.IDProgramacion}
                  item={item}
                  status={status}
                  isOpen={isOpen}
                  canceling={canceling}
                  onToggleExpand={() => handleToggleExpand(item.IDProgramacion)}
                  onAskTvMed={() => setShowTvMedFor(item.CodSerTecAEntregar)}
                  onAskCancel={() => setConfirmFor(item)}
                />
              )
            })}
          </tbody>
        </table>
      </div>

      {showTvMedFor && (
        <TvMedProductsModal
          code={showTvMedFor}
          onClose={() => setShowTvMedFor(null)}
        />
      )}

      {confirmFor && (
        <ConfirmCancelScheduleModal
          scheduleId={confirmFor.IDProgramacion}
          loading={cancelingIds.has(confirmFor.IDProgramacion)}
          onConfirm={async () => {
            await onCancel(confirmFor)
            setConfirmFor(null)
          }}
          onClose={() => setConfirmFor(null)}
        />
      )}
        </>
      )}

      {showDebug && (
        <RequestDebugModal
          title="Programaciones · GET /mipres/schedule/prescription/{n}"
          meta={loadSchedulesMeta}
          onClose={() => setShowDebug(false)}
        />
      )}
    </>
  )
}

// ─── CARD LAYOUT (default; <xl) ────────────────────────────────────────────

interface ScheduleCardProps {
  item: ScheduleItem
  isOpen: boolean
  canceling: boolean
  onToggleExpand: () => void
  onAskTvMed: () => void
  onAskCancel: () => void
}

function ScheduleCard({
  item,
  isOpen,
  canceling,
  onToggleExpand,
  onAskTvMed,
  onAskCancel,
}: ScheduleCardProps) {
  const status = scheduleStatus(item)
  const active = status !== 'canceled'
  return (
    <article
      className={[
        'overflow-hidden rounded-lg border bg-white shadow-sm transition-all',
        canceling ? 'animate-pulse border-amber-200 bg-amber-50' : 'border-slate-200',
        active || canceling ? '' : 'opacity-75',
      ].join(' ')}
    >
      <header className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <div className="w-28 shrink-0">
          {canceling ? <CancelingPill /> : <StatusPill status={status} />}
        </div>

        <div className="w-32 shrink-0">
          <Block label="IDProgramacion">
            <span className="font-mono text-base font-bold text-slate-900">
              {item.IDProgramacion > 0 ? item.IDProgramacion : '—'}
            </span>
          </Block>
        </div>

        <div className="w-44 shrink-0">
          <Block label="Código del producto">
            <span className="flex items-center gap-1.5">
              <span className="font-mono text-base font-bold text-slate-900">
                {item.CodSerTecAEntregar}
              </span>
              <button
                type="button"
                onClick={onAskTvMed}
                aria-label={`Ver productos TvMed para código ${item.CodSerTecAEntregar}`}
                title={`Ver productos TvMed para código ${item.CodSerTecAEntregar}`}
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-primary/5 hover:text-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </span>
          </Block>
        </div>

        <div className="w-44 shrink-0">
          <Block label="Fec. Programación">
            <span className="font-mono text-sm font-bold text-slate-900">
              {fmtDateTime(item.FecProgramacion)}
            </span>
          </Block>
        </div>

        <div className="w-20 shrink-0">
          <Block label="Cant.">
            <span className="font-mono text-base font-bold text-slate-900">
              {item.CantTotAEntregar}
            </span>
          </Block>
        </div>

        <div className="w-32 shrink-0">
          <Block label={status === 'canceled' ? 'Fec. Anulación' : 'Fec. Máx Entrega'}>
            <span className="font-mono text-sm font-bold text-slate-900">
              {status === 'canceled' ? fmtDate(item.FecAnulacion) : fmtDate(item.FecMaxEnt)}
            </span>
          </Block>
        </div>

        {status === 'active' && (
          <button
            type="button"
            onClick={onAskCancel}
            disabled={canceling}
            title="Anular esta programación en SISPRO"
            className="ml-auto inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-red-600 px-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-red-700 focus:outline-none focus:ring-[3px] focus:ring-red-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {canceling ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Anulando
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Anular
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onToggleExpand}
          aria-label={isOpen ? 'Colapsar detalle' : 'Ver detalle completo'}
          aria-expanded={isOpen}
          title={isOpen ? 'Colapsar' : 'Ver detalle completo'}
          className={[
            'flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25',
            status === 'active' ? '' : 'ml-auto',
          ].join(' ')}
        >
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </header>

      {isOpen && <ExpandedFields item={item} />}
    </article>
  )
}

function PendingBindSkeletonCard() {
  return (
    <article className="overflow-hidden rounded-lg border border-primary/30 bg-primary/5 shadow-sm">
      <header className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Registrando
        </span>
        <div className="h-3 w-32 animate-pulse rounded bg-primary/15" />
        <div className="h-3 w-24 animate-pulse rounded bg-primary/15" />
        <div className="h-3 w-28 animate-pulse rounded bg-primary/15" />
        <span className="ml-auto text-[11px] italic text-primary/70">esperando SISPRO…</span>
      </header>
    </article>
  )
}

// ─── TABLE LAYOUT (xl+) ────────────────────────────────────────────────────

interface ThProps {
  label: string
  k: SortKey
  sortKey: SortKey
  sortDir: SortDir
  onClick: (k: SortKey) => void
  width: string
  align?: 'left' | 'right'
}

function Th({ label, k, sortKey, sortDir, onClick, width, align = 'left' }: ThProps) {
  const isActive = sortKey === k
  const Icon = !isActive ? ChevronsUpDown : sortDir === 'asc' ? ChevronUp : ChevronDown
  return (
    <th className={`${width} px-3 py-2.5 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button
        type="button"
        onClick={() => onClick(k)}
        className={`inline-flex cursor-pointer items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider transition-colors ${
          isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        {label}
        <Icon className="h-3 w-3" />
      </button>
    </th>
  )
}

interface FragmentRowProps {
  item: ScheduleItem
  status: ScheduleStatus
  isOpen: boolean
  canceling: boolean
  onToggleExpand: () => void
  onAskTvMed: () => void
  onAskCancel: () => void
}

function FragmentRow({
  item,
  status,
  isOpen,
  canceling,
  onToggleExpand,
  onAskTvMed,
  onAskCancel,
}: FragmentRowProps) {
  const active = status !== 'canceled'
  return (
    <>
      <tr
        className={`border-b border-slate-100 transition-colors ${
          canceling
            ? 'animate-pulse bg-amber-50'
            : isOpen
              ? 'bg-primary/5'
              : 'hover:bg-slate-50'
        } ${active && !canceling ? '' : 'opacity-75'}`}
      >
        <td className="px-3 py-2.5">
          {canceling ? <CancelingPill /> : <StatusPill status={status} />}
        </td>
        <td className="px-3 py-2.5 font-mono text-xs tabular-nums text-slate-700">
          {fmtDateTime(item.FecProgramacion)}
        </td>
        <td className="px-3 py-2.5 font-mono text-sm font-bold text-slate-900">
          {item.IDProgramacion > 0 ? item.IDProgramacion : '—'}
        </td>
        <td className="px-3 py-2.5">
          <span className="inline-flex items-center gap-1.5">
            <span className="font-mono text-sm font-semibold text-slate-900">
              {item.CodSerTecAEntregar}
            </span>
            <button
              type="button"
              onClick={onAskTvMed}
              aria-label={`Ver productos TvMed para código ${item.CodSerTecAEntregar}`}
              title={`Ver productos TvMed para código ${item.CodSerTecAEntregar}`}
              className="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-slate-400 transition-colors hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </span>
        </td>
        <td className="px-3 py-2.5 text-right font-mono text-sm tabular-nums text-slate-900">
          {item.CantTotAEntregar}
        </td>
        <td className="px-3 py-2.5 font-mono text-xs tabular-nums text-slate-700">
          {fmtDate(item.FecMaxEnt)}
        </td>
        <td className="px-3 py-2.5">
          {status === 'active' ? (
            <button
              type="button"
              onClick={onAskCancel}
              disabled={canceling}
              title="Anular esta programación en SISPRO"
              className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-md bg-red-600 px-2.5 text-[11.5px] font-bold text-white transition-colors duration-150 hover:bg-red-700 focus:outline-none focus:ring-[3px] focus:ring-red-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {canceling ? (
                <>
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Anulando
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5" />
                  Anular
                </>
              )}
            </button>
          ) : (
            <span className="text-[10.5px] text-slate-400">—</span>
          )}
        </td>
        <td className="px-2 py-2.5 text-right">
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={isOpen ? 'Colapsar detalle' : 'Ver detalle completo'}
            aria-expanded={isOpen}
            title={isOpen ? 'Colapsar' : 'Ver detalle completo'}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </td>
      </tr>
      {isOpen && (
        <tr className="border-b border-slate-200 bg-slate-50/60">
          <td colSpan={8} className="px-3 py-3">
            <ExpandedFields item={item} />
          </td>
        </tr>
      )}
    </>
  )
}

function PendingBindSkeletonRow() {
  return (
    <tr className="border-b border-slate-100 bg-primary/5">
      <td className="px-3 py-2.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Registrando
        </span>
      </td>
      <td className="px-3 py-2.5">
        <div className="h-3 w-32 animate-pulse rounded bg-primary/15" />
      </td>
      <td className="px-3 py-2.5">
        <div className="h-3 w-20 animate-pulse rounded bg-primary/15" />
      </td>
      <td className="px-3 py-2.5">
        <div className="h-3 w-24 animate-pulse rounded bg-primary/15" />
      </td>
      <td className="px-3 py-2.5 text-right">
        <div className="ml-auto h-3 w-10 animate-pulse rounded bg-primary/15" />
      </td>
      <td className="px-3 py-2.5">
        <div className="h-3 w-20 animate-pulse rounded bg-primary/15" />
      </td>
      <td className="px-3 py-2.5">
        <span className="text-[10.5px] italic text-primary/70">esperando SISPRO</span>
      </td>
      <td className="px-2 py-2.5" />
    </tr>
  )
}

// ─── SHARED ──────────────────────────────────────────────────────────────────

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <span className="leading-tight">{children}</span>
    </div>
  )
}

function StatusPill({ status }: { status: ScheduleStatus }) {
  if (status === 'active') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
        Vigente
      </span>
    )
  }
  if (status === 'delivered') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
        Completada
      </span>
    )
  }
  if (status === 'canceled') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
        Anulada
      </span>
    )
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
      —
    </span>
  )
}

function CancelingPill() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
      <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
      Anulando
    </span>
  )
}

function ExpandedFields({ item }: { item: ScheduleItem }) {
  const fields: Array<{ label: string; value: string | number | null }> = [
    { label: 'ID', value: item.ID },
    { label: 'TipoTec', value: item.TipoTec },
    { label: 'ConTec', value: item.ConTec },
    { label: 'NoEntrega', value: item.NoEntrega },
    { label: 'TipoIDSedeProv', value: item.TipoIDSedeProv },
    { label: 'NoIDSedeProv', value: item.NoIDSedeProv },
    { label: 'CodSedeProv', value: item.CodSedeProv },
    { label: 'EstProgramacion', value: item.EstProgramacion },
    { label: 'FecAnulacion', value: item.FecAnulacion },
  ]
  return (
    <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3 xl:border-t-0 xl:bg-transparent xl:px-0 xl:py-0">
      <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((f) => (
          <div
            key={f.label}
            className="flex items-baseline justify-between gap-3 border-b border-slate-200/70 pb-1.5"
          >
            <dt className="font-mono text-slate-500">{f.label}</dt>
            <dd
              className="m-0 truncate font-mono font-semibold text-slate-900"
              title={String(f.value ?? '')}
            >
              {f.value ?? '—'}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-[68px] animate-pulse rounded-lg border border-slate-200 bg-white"
        />
      ))}
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertCircle className="h-7 w-7" />
      </div>
      <p className="text-sm font-semibold text-slate-700">No se pudo cargar programaciones</p>
      <p className="max-w-sm text-xs text-slate-500">{message}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Inbox className="h-7 w-7" />
      </div>
      <p className="text-sm font-semibold text-slate-700">Sin programaciones</p>
      <p className="max-w-sm text-xs text-slate-500">
        No hay programaciones registradas para esta prescripción.
      </p>
    </div>
  )
}
