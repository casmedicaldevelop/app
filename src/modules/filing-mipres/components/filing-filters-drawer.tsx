import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { type FilingFilters } from '../types/filing-mipres.types'

interface FilingFiltersDrawerProps {
  open: boolean
  value: FilingFilters
  /** Estado inicial al que vuelve el botón "Limpiar" (no vacío). */
  defaultValue: FilingFilters
  onClose: () => void
  onApply: (filters: FilingFilters) => void
}

const SECTION_LABEL = 'text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'
const FIELD_LABEL = 'mb-1 block text-xs font-medium text-foreground'
const INPUT =
  'h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors'

export default function FilingFiltersDrawer({
  open,
  value,
  defaultValue,
  onClose,
  onApply,
}: FilingFiltersDrawerProps) {
  const [draft, setDraft] = useState<FilingFilters>(value)

  // Al abrir, sincroniza el borrador con los filtros aplicados actuales.
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

  const set = <K extends keyof FilingFilters>(key: K, val: FilingFilters[K]) =>
    setDraft((prev) => ({ ...prev, [key]: val }))

  const segBtn = (active: boolean) =>
    `rounded-md py-1.5 text-sm transition-colors cursor-pointer ${
      active
        ? 'bg-primary font-semibold text-primary-foreground'
        : 'font-medium text-muted-foreground hover:bg-background'
    }`

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 bg-[#2d3436]/40" onClick={onClose} aria-hidden="true" />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col bg-background shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Filtrar radicaciones"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Filtrar radicaciones</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* Identificación */}
          <section>
            <div className="mb-3 flex items-center gap-3">
              <span className={SECTION_LABEL}>Identificación</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-3">
              <div>
                <label className={FIELD_LABEL}>Código de radicación</label>
                <input
                  type="text"
                  value={draft.filingCode}
                  onChange={(e) => set('filingCode', e.target.value)}
                  placeholder="Ej: 1024"
                  className={INPUT}
                />
              </div>
              <div>
                <label className={FIELD_LABEL}>Documento de usuario</label>
                <input
                  type="text"
                  value={draft.userDocument}
                  onChange={(e) => set('userDocument', e.target.value)}
                  placeholder="Ej: 6599806"
                  className={`${INPUT} font-mono`}
                />
              </div>
              <div>
                <label className={FIELD_LABEL}>Prescripción</label>
                <input
                  type="text"
                  value={draft.prescriptionNumber}
                  onChange={(e) => set('prescriptionNumber', e.target.value)}
                  placeholder="Ej: 20260228169000532987"
                  className={`${INPUT} font-mono`}
                />
              </div>
            </div>
          </section>

          {/* Estado */}
          <section className="mt-6">
            <div className="mb-3 flex items-center gap-3">
              <span className={SECTION_LABEL}>Estado</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div>
              <label className={FIELD_LABEL}>Estado</label>
              <select
                value={draft.status}
                onChange={(e) => set('status', e.target.value)}
                className={`${INPUT} cursor-pointer`}
              >
                <option value="">Todos</option>
                <option value="PENDIENTE">PENDIENTE</option>
                <option value="ENTREGA_PARCIAL">ENTREGA_PARCIAL</option>
                <option value="ENTREGADO">ENTREGADO</option>
              </select>
            </div>
          </section>

          {/* Fecha de creación */}
          <section className="mt-6">
            <div className="mb-3 flex items-center gap-3">
              <span className={SECTION_LABEL}>Fecha de creación</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <div
              className="grid grid-cols-2 rounded-lg border border-input bg-muted p-0.5"
              role="tablist"
              aria-label="Modo de filtro por fecha"
            >
              <button
                type="button"
                role="tab"
                aria-selected={draft.dateMode === 'exacta'}
                onClick={() => set('dateMode', 'exacta')}
                className={segBtn(draft.dateMode === 'exacta')}
              >
                Fecha exacta
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={draft.dateMode === 'rango'}
                onClick={() => set('dateMode', 'rango')}
                className={segBtn(draft.dateMode === 'rango')}
              >
                Rango
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Elegí una sola forma de filtrar por fecha.
            </p>

            {draft.dateMode === 'exacta' ? (
              <div className="mt-3">
                <label className={FIELD_LABEL}>Fecha</label>
                <input
                  type="date"
                  value={draft.dateExact}
                  onChange={(e) => set('dateExact', e.target.value)}
                  className={INPUT}
                />
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className={FIELD_LABEL}>Desde</label>
                  <input
                    type="date"
                    value={draft.dateFrom}
                    onChange={(e) => set('dateFrom', e.target.value)}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className={FIELD_LABEL}>Hasta</label>
                  <input
                    type="date"
                    value={draft.dateTo}
                    onChange={(e) => set('dateTo', e.target.value)}
                    className={INPUT}
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center gap-3 border-t border-border bg-muted/30 px-5 py-4">
          <button
            type="button"
            onClick={() => {
              setDraft({ ...defaultValue })
              onApply({ ...defaultValue })
            }}
            className="h-9 flex-1 cursor-pointer rounded-lg border border-input px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={() => onApply(draft)}
            className="h-9 flex-1 cursor-pointer rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Aplicar filtros
          </button>
        </div>
      </aside>
    </>,
    document.body,
  )
}
