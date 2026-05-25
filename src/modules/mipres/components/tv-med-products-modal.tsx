import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, FileSearch, X } from 'lucide-react'
import { tvMedService } from '../../tv-med/services/tv-med.service'
import type { TvMed } from '../../tv-med/types/tv-med.types'

interface TvMedProductsModalProps {
  code: string
  onClose: () => void
}

export default function TvMedProductsModal({ code, onClose }: TvMedProductsModalProps) {
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

  const query = useQuery({
    queryKey: ['tv-med-by-code', code],
    // Backend DTO caps `limit` at 100. Realistically far fewer products share a
    // single CodSerTec, so 100 is enough.
    queryFn: () => tvMedService.list({ search: code, limit: 100 }),
  })

  // SISPRO returns codes like "139" — backend `search` does substring/contains match.
  // Filter client-side to exact code match so the modal only shows products that
  // actually correspond to this CodSerTecAEntregar.
  const matches: TvMed[] =
    query.data?.data.filter((row) => row.code === code) ?? []

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Productos TvMed para código ${code}`}
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Productos TvMed</h2>
            <span className="rounded bg-slate-200 px-2 py-0.5 font-mono text-[12px] font-semibold text-slate-700">
              CodSerTecAEntregar {code}
            </span>
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

        <div className="flex-1 overflow-auto bg-white p-4">
          {query.isPending && <LoadingSkeleton />}
          {query.isError && (
            <ErrorState message="No se pudo cargar productos TvMed. Reintentá luego." />
          )}
          {!query.isPending && !query.isError && matches.length === 0 && (
            <EmptyState code={code} />
          )}
          {matches.length > 0 && <ProductsList items={matches} />}
        </div>

        {matches.length > 0 && (
          <footer className="border-t border-slate-200 bg-slate-50 px-5 py-2 text-xs text-slate-500">
            {matches.length} {matches.length === 1 ? 'producto encontrado' : 'productos encontrados'}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-md bg-slate-100" />
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

function EmptyState({ code }: { code: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <FileSearch className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-slate-700">
        Sin productos TvMed registrados
      </p>
      <p className="max-w-sm text-xs text-slate-500">
        No hay productos en el catálogo TvMed con código <strong className="font-mono">{code}</strong>. Agregalos en el módulo TvMed para que aparezcan acá.
      </p>
    </div>
  )
}

function ProductsList({ items }: { items: TvMed[] }) {
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((p) => (
        <li
          key={p.id}
          className="flex items-center gap-3 px-1 py-2.5"
        >
          <span className="font-mono text-xs text-slate-500 shrink-0">#{p.id}</span>
          <span className="font-mono text-sm font-bold text-slate-900 shrink-0">{p.code}</span>
          <span className="truncate text-sm text-slate-700" title={p.name}>{p.name}</span>
        </li>
      ))}
    </ul>
  )
}
