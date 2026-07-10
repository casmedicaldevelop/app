import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { SlidersHorizontal, X } from 'lucide-react'

/**
 * Drawer de filtros desde la derecha — estándar de la app (igual que filing-filters-drawer).
 * El único filtro server-side del catálogo TvData es la búsqueda de texto
 * (código / nombre / cód. inventario), así que es lo que vive acá.
 */
interface Props {
  open: boolean
  value: string
  onClose: () => void
  onApply: (search: string) => void
}

export default function TvDataFiltersDrawer({ open, value, onClose, onApply }: Props) {
  const [draft, setDraft] = useState(value)

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

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 bg-[#2d3436]/40" onClick={onClose} aria-hidden="true" />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col bg-background shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Filtrar registros"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Filtrar registros</h2>
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

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <label htmlFor="tvf-search" className="mb-1 block text-xs font-medium text-foreground">
            Búsqueda
          </label>
          <input
            id="tvf-search"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onApply(draft)
            }}
            placeholder="Código, nombre o cód. inventario"
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Busca por código, nombre o código de inventario.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 border-t border-border bg-muted/30 px-5 py-4">
          <button
            type="button"
            onClick={() => {
              setDraft('')
              onApply('')
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
