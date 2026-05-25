import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, FileSearch, Search, X } from 'lucide-react'
import { tvMedService } from '../../tv-med/services/tv-med.service'
import type { TvMed } from '../../tv-med/types/tv-med.types'

interface TvMedPickerModalProps {
  onSelect: (item: TvMed) => void
  onClose: () => void
}

const MIN_CHARS = 2
const DEBOUNCE_MS = 300

export default function TvMedPickerModal({ onSelect, onClose }: TvMedPickerModalProps) {
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const enabled = debounced.length >= MIN_CHARS

  const query = useQuery({
    queryKey: ['tv-med-picker', debounced],
    queryFn: () => tvMedService.list({ search: debounced, limit: 100 }),
    enabled,
  })

  const items: TvMed[] = query.data?.data ?? []

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Buscar producto en TvMed"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-slate-900">Buscar producto en TvMed</h2>
            <span className="text-[11px] text-slate-500">por código o nombre</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus:ring-[3px] focus:ring-primary/25"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="border-b border-slate-200 bg-white p-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tipeá código o nombre del producto..."
            autoFocus
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
          />
        </div>

        <div className="flex-1 overflow-auto bg-white">
          {!enabled && (
            <PromptState message={`Tipeá al menos ${MIN_CHARS} caracteres para buscar`} />
          )}
          {enabled && query.isPending && <LoadingSkeleton />}
          {enabled && query.isError && (
            <ErrorState message="No se pudo buscar en TvMed. Reintentá." />
          )}
          {enabled && !query.isPending && !query.isError && items.length === 0 && (
            <EmptyState query={debounced} />
          )}
          {items.length > 0 && (
            <ul className="divide-y divide-slate-100">
              {items.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(p)}
                    className="flex w-full cursor-pointer items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-primary/5 focus:bg-primary/5 focus:outline-none"
                  >
                    <span className="shrink-0 whitespace-nowrap font-mono text-sm font-bold text-slate-900">
                      {p.code}
                    </span>
                    <span className="line-clamp-2 text-sm text-slate-700">
                      {p.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-slate-200 bg-slate-50 px-5 py-2 text-xs text-slate-500">
            {items.length} {items.length === 1 ? 'resultado' : 'resultados'} — click para seleccionar
          </footer>
        )}
      </div>
    </div>,
    document.body,
  )
}

function PromptState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Search className="h-6 w-6" />
      </div>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-md bg-slate-100" />
      ))}
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <AlertCircle className="h-8 w-8 text-red-600" />
      <p className="text-sm text-slate-700">{message}</p>
    </div>
  )
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <FileSearch className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-slate-700">Sin resultados</p>
      <p className="max-w-sm text-xs text-slate-500">
        No se encontraron productos TvMed para <strong className="font-mono">{query}</strong>. Probá
        otro código o nombre.
      </p>
    </div>
  )
}
