import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import type { FilingEventFilters } from '../types/filing-event-filters.types'

const SECTION_LABEL = 'text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'
const FIELD_LABEL = 'mb-1 block text-xs font-medium text-foreground'
const INPUT = 'h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors'

export default function FilingEventFiltersDrawer({ open, value, defaultValue, onClose, onApply }: {
  open: boolean
  value: FilingEventFilters
  defaultValue: FilingEventFilters
  onClose: () => void
  onApply: (filters: FilingEventFilters) => void
}) {
  const [draft, setDraft] = useState<FilingEventFilters>(value)

  useEffect(() => { if (open) setDraft(value) }, [open, value])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])

  if (!open) return null

  const set = <K extends keyof FilingEventFilters>(key: K, val: FilingEventFilters[K]) =>
    setDraft((prev) => ({ ...prev, [key]: val }))

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 bg-[#2d3436]/40" onClick={onClose} aria-hidden="true" />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col bg-background shadow-2xl" role="dialog" aria-modal="true" aria-label="Filtrar radicaciones">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Filtrar radicaciones</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <section>
            <div className="mb-3 flex items-center gap-3"><span className={SECTION_LABEL}>Usuario</span><span className="h-px flex-1 bg-border" /></div>
            <div className="space-y-3">
              <div>
                <label className={FIELD_LABEL}>Documento de usuario</label>
                <input type="text" value={draft.userDocument} onChange={(e) => set('userDocument', e.target.value)} placeholder="Ej: 7230456" className={`${INPUT} font-mono`} />
              </div>
              <div>
                <label className={FIELD_LABEL}>Nombre</label>
                <input type="text" value={draft.userName} onChange={(e) => set('userName', e.target.value)} placeholder="Ej: SANABRIA" className={INPUT} />
              </div>
            </div>
          </section>

          <section className="mt-6">
            <div className="mb-3 flex items-center gap-3"><span className={SECTION_LABEL}>Régimen</span><span className="h-px flex-1 bg-border" /></div>
            <div>
              <label className={FIELD_LABEL}>Régimen</label>
              <select value={draft.userType} onChange={(e) => set('userType', e.target.value)} className={`${INPUT} cursor-pointer`}>
                <option value="">Todos</option>
                <option value="CONTRIBUTIVO">CONTRIBUTIVO</option>
                <option value="SUBSIDIADO">SUBSIDIADO</option>
              </select>
            </div>
          </section>
        </div>

        <div className="flex shrink-0 items-center gap-3 border-t border-border bg-muted/30 px-5 py-4">
          <button type="button" onClick={() => { setDraft({ ...defaultValue }); onApply({ ...defaultValue }) }} className="h-9 flex-1 cursor-pointer rounded-lg border border-input px-4 text-sm font-medium transition-colors hover:bg-muted">Limpiar</button>
          <button type="button" onClick={() => onApply(draft)} className="h-9 flex-1 cursor-pointer rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">Aplicar filtros</button>
        </div>
      </aside>
    </>,
    document.body,
  )
}
