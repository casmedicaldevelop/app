import { createPortal } from 'react-dom'
import {
  Barcode,
  Box,
  CalendarDays,
  CircleDot,
  DollarSign,
  FlaskConical,
  Hash,
  Package,
  Pill,
  Route,
  Ruler,
  Tag,
  type LucideIcon,
} from 'lucide-react'
import type { TvMedEvento } from '../types/tvmed-evento.types'

/** Acepta una fila de tvmed_evento o tvins_evento (misma forma). */
export type TvEventoRow = TvMedEvento

const fmtCop = (n: number) =>
  `$ ${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)}`
const fmtDate = (iso: string) => {
  if (!iso) return '—'
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${y}/${m}/${d}`
}

function Card({
  icon: Icon,
  label,
  value,
  mono = false,
  className = '',
  full = false,
}: {
  icon: LucideIcon
  label: string
  value: string
  mono?: boolean
  className?: string
  full?: boolean
}) {
  return (
    <div className={`min-w-0 rounded-lg border px-4 py-3 ${className || 'border-border bg-muted/40'} ${full ? 'col-span-2 lg:col-span-4' : ''}`}>
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
        {label}
      </div>
      <div className={`text-sm font-medium text-foreground break-words ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  )
}

/** Modal inferior, ancho completo, con toda la información de un registro de tvmed/tvins. */
export default function TvEventoRowModal({ row, onClose }: { row: TvEventoRow; table?: string; onClose: () => void }) {
  const estadoCls = row.isActive
    ? 'border-emerald-200 bg-emerald-50'
    : 'border-rose-200 bg-rose-50'
  const estadoText = row.isActive ? 'text-emerald-700' : 'text-rose-600'

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col border-t border-border bg-background shadow-2xl">
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <h2 className="min-w-0 truncate text-base font-semibold text-foreground">{row.name}</h2>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Card icon={Hash} label="ID" value={String(row.id)} mono />
            <Card icon={Barcode} label="CUM" value={row.cum} mono />
            <div className={`min-w-0 rounded-lg border px-4 py-3 ${estadoCls}`}>
              <div className={`mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${estadoText}`}>
                <CircleDot className="h-3.5 w-3.5 shrink-0" />
                Estado
              </div>
              <div className={`text-sm font-semibold ${estadoText}`}>{row.isActive ? 'Activo' : 'Inactivo'}</div>
            </div>
            <Card icon={DollarSign} label="Valor" value={fmtCop(row.value)} mono />

            <Card icon={Tag} label="Nombre corto" value={row.shortName} />
            <Card icon={FlaskConical} label="Concentración" value={row.concentration} />
            <Card icon={Package} label="Presentación" value={row.presentation} />
            <Card icon={Route} label="Vía de administración" value={row.administrationRoute} />

            <Card icon={Ruler} label="Unidad de medida" value={row.measurementUnitRef?.name ?? String(row.measurementUnit)} />
            <Card icon={Pill} label="Forma farmacéutica" value={row.pharmaceuticalFormRef?.description ?? row.pharmaceuticalForm} />
            <Card icon={Box} label="Unidad de dispensación" value={row.dispensingUnitRef?.description ?? String(row.dispensingUnit)} />
            <Card icon={CalendarDays} label="Fecha de creación" value={fmtDate(row.createdAt)} mono />
          </div>
        </div>

        <div className="flex justify-end border-t border-border px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose}
            className="h-10 rounded-lg border border-input px-5 text-sm font-medium text-foreground cursor-pointer transition-colors hover:bg-muted">
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
