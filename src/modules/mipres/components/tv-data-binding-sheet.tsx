import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Check, ChevronDown, FileSearch, Plus, Search, UserRound, X } from 'lucide-react'
import { tvDataService } from '../../tv-data/services/tv-data.service'
import type { TvData } from '../../tv-data/types/tv-data.types'
import DoctorDrawer from '../../doctors/components/doctor-drawer'
import type { Doctor } from '../../doctors/types/doctor.types'

interface TvDataBindingSheetProps {
  code: string
  lastSelectedId?: number
  selectedDoctor: Doctor | null
  onSelectDoctor: (doctor: Doctor | null) => void
  onSelect: (item: TvData) => void
  onClose: () => void
}

const NAME_DEBOUNCE_MS = 200

export default function TvDataBindingSheet({
  code,
  lastSelectedId,
  selectedDoctor,
  onSelectDoctor,
  onSelect,
  onClose,
}: TvDataBindingSheetProps) {
  const [nameFilter, setNameFilter] = useState('')
  const [debouncedName, setDebouncedName] = useState('')
  const [doctorDrawerOpen, setDoctorDrawerOpen] = useState(false)
  const [doctorDrawerCreateMode, setDoctorDrawerCreateMode] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedName(nameFilter.trim().toLowerCase()), NAME_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [nameFilter])

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
    queryKey: ['tv-data-binding', code],
    queryFn: () => tvDataService.list({ search: code, limit: 200 }),
    enabled: code.length > 0,
  })

  const filtered: TvData[] = (query.data?.data ?? []).filter(
    (r) => r.code === code && (debouncedName === '' || r.name.toLowerCase().includes(debouncedName)),
  )
  const rows: TvData[] = lastSelectedId
    ? [
        ...filtered.filter((r) => r.id === lastSelectedId),
        ...filtered.filter((r) => r.id !== lastSelectedId),
      ]
    : filtered

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end bg-[#2d3436]/40"
      role="dialog"
      aria-modal="true"
      aria-label="Seleccionar producto a amarrar"
      onClick={onClose}
    >
      <div
        className="relative flex h-[70vh] w-full flex-col overflow-hidden rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-[#2d3436]">Seleccionar producto a amarrar</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDoctorDrawerCreateMode(false)
                setDoctorDrawerOpen(true)
              }}
              title={selectedDoctor ? 'Cambiar doctor' : 'Asignar doctor'}
              className={`group flex cursor-pointer items-center gap-2 rounded-full border py-1.5 pl-2 pr-3 text-sm font-semibold transition ${
                selectedDoctor
                  ? 'border-primary/20 bg-primary/10 text-primary hover:bg-primary/15'
                  : 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  selectedDoctor ? 'bg-primary text-white' : 'bg-amber-200 text-amber-800'
                }`}
              >
                <UserRound className="h-3.5 w-3.5" />
              </span>
              {selectedDoctor ? (
                <>
                  <span className="flex flex-col items-start leading-tight">
                    <span className="text-[10px] uppercase tracking-wider text-primary/70">Doctor</span>
                    <span className="text-xs font-bold">{selectedDoctor.name}</span>
                  </span>
                  <Check className="h-4 w-4 text-emerald-600" />
                </>
              ) : (
                <span className="text-xs">Sin doctor asignado</span>
              )}
              <ChevronDown className="h-3.5 w-3.5 opacity-70 transition group-hover:translate-y-0.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setDoctorDrawerCreateMode(true)
                setDoctorDrawerOpen(true)
              }}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Nuevo doctor
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="ml-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200 hover:text-[#2d3436] focus:outline-none focus:ring-[3px] focus:ring-primary/25"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex items-end gap-3 border-b border-slate-200 bg-white px-5 py-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-slate-600">Código</span>
            <input
              type="text"
              value={code}
              readOnly
              tabIndex={-1}
              aria-label="Código de tecnología (solo lectura)"
              className="h-10 w-24 cursor-not-allowed rounded-md border border-slate-300 bg-slate-100 px-3 font-mono text-sm font-bold text-[#2d3436]"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-[11px] font-semibold text-slate-600">Filtrar por nombre</span>
            <input
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Tipeá parte del nombre del medicamento..."
              autoFocus
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-[#2d3436] placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
            />
          </label>
        </div>

        <div className="flex-1 overflow-auto">
          {query.isPending && <LoadingSkeleton />}
          {query.isError && <ErrorState />}
          {!query.isPending && !query.isError && rows.length === 0 && <EmptyState code={code} />}
          {rows.length > 0 && (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-2 text-left">Código</th>
                  <th className="px-5 py-2 text-left">Nombre</th>
                  <th className="px-5 py-2 text-left">Cód. Inventario</th>
                  <th className="px-5 py-2 text-right">Precio</th>
                  <th className="px-5 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const isLast = lastSelectedId === p.id
                  return (
                    <tr
                      key={p.id}
                      className={`border-t border-slate-100 transition-colors hover:bg-primary/5 ${
                        isLast ? 'bg-primary/10' : ''
                      }`}
                    >
                      <td className="px-5 py-2 font-mono font-bold text-[#2d3436]">{p.code}</td>
                      <td className="px-5 py-2 text-slate-700">{p.name}</td>
                      <td className="px-5 py-2 font-mono text-slate-700">{p.inventoryCode ?? '—'}</td>
                      <td className="px-5 py-2 text-right text-[#2d3436]">
                        $ {p.price.toLocaleString('es-CO')}
                      </td>
                      <td className="px-5 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => onSelect(p)}
                          className="inline-flex h-8 cursor-pointer items-center rounded-md bg-primary px-3 text-xs font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-[3px] focus:ring-primary/25"
                        >
                          {isLast ? 'Seleccionado' : 'Seleccionar'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {rows.length > 0 && (
          <footer className="border-t border-slate-200 bg-slate-50 px-5 py-2 text-xs text-slate-500">
            {rows.length} {rows.length === 1 ? 'resultado' : 'resultados'} — click en el botón Seleccionar
          </footer>
        )}

        <DoctorDrawer
          open={doctorDrawerOpen}
          onClose={() => setDoctorDrawerOpen(false)}
          selected={selectedDoctor}
          onSelect={onSelectDoctor}
          initialCreateMode={doctorDrawerCreateMode}
        />
      </div>
    </div>,
    document.body,
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2 p-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-9 animate-pulse rounded-md bg-slate-100" />
      ))}
    </div>
  )
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <AlertCircle className="h-8 w-8 text-[#ee5253]" />
      <p className="text-sm text-slate-700">No se pudo cargar TvData. Reintentá.</p>
    </div>
  )
}

function EmptyState({ code }: { code: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <FileSearch className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-slate-700">Sin resultados</p>
      <p className="max-w-sm text-xs text-slate-500">
        No hay productos TvData con código <strong className="font-mono">{code}</strong> que coincidan con el filtro.
      </p>
    </div>
  )
}
