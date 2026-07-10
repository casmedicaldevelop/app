import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { SlidersHorizontal } from 'lucide-react'
import { EMPTY_EVENTO_FILTERS, type EventoFilters } from '../types/tvins-evento.types'

interface Props {
  open: boolean
  value: EventoFilters
  onClose: () => void
  onApply: (filters: EventoFilters) => void
}

const LABEL = 'mb-1 block text-xs font-medium text-foreground'
const INPUT =
  'h-9 w-full rounded-lg border border-input bg-background px-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

export default function TvInsEventoFiltersDrawer({ open, value, onClose, onApply }: Props) {
  const [draft, setDraft] = useState<EventoFilters>(value)

  useEffect(() => {
    if (open) setDraft(value)
  }, [open, value])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const set = <K extends keyof EventoFilters>(key: K, v: EventoFilters[K]) =>
    setDraft((prev) => ({ ...prev, [key]: v }))

  const text = (key: keyof EventoFilters, label: string) => (
    <div>
      <label className={LABEL}>{label}</label>
      <input
        type="text"
        value={draft[key]}
        onChange={(e) => set(key, e.target.value)}
        className={INPUT}
      />
    </div>
  )

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 bg-[#2d3436]/40" onClick={onClose} aria-hidden="true" />
      <aside
        className="fixed inset-y-0 left-0 z-50 flex w-[320px] flex-col bg-background shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Filtrar registros"
      >
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-3">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Filtrar registros</h2>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-3 py-5">
          {text('cum', 'CUM')}
          {text('name', 'Nombre')}
          <div>
            <label className={LABEL}>Estado</label>
            <select
              value={draft.estado}
              onChange={(e) => set('estado', e.target.value)}
              className={INPUT}
            >
              <option value="">Todos</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 border-t border-border bg-muted/30 px-3 py-4">
          <button
            type="button"
            onClick={() => onApply({ ...EMPTY_EVENTO_FILTERS })}
            className="h-9 flex-1 cursor-pointer rounded-lg border border-input px-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={() => onApply(draft)}
            className="h-9 flex-1 cursor-pointer rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Filtrar
          </button>
        </div>
      </aside>
    </>,
    document.body,
  )
}
