import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronRight, Loader2, Plus, Search, UserRound, X } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateDoctor, useDoctorsList } from '../hooks/use-doctors'
import type { Doctor } from '../types/doctor.types'

interface DoctorDrawerProps {
  open: boolean
  onClose: () => void
  selected: Doctor | null
  onSelect: (doctor: Doctor) => void
  initialCreateMode?: boolean
}

const DEBOUNCE_MS = 200

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function DoctorDrawer({
  open,
  onClose,
  selected,
  onSelect,
  initialCreateMode = false,
}: DoctorDrawerProps) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [createMode, setCreateMode] = useState(initialCreateMode)
  const [createId, setCreateId] = useState('')
  const [createName, setCreateName] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    if (open) setCreateMode(initialCreateMode)
  }, [open, initialCreateMode])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const listQuery = useDoctorsList(debounced)
  const createMutation = useCreateDoctor()

  const doctors = useMemo(() => listQuery.data ?? [], [listQuery.data])

  const handlePick = (doctor: Doctor) => {
    onSelect(doctor)
    onClose()
  }

  const handleStartCreate = () => {
    const looksLikeId = /^\d+$/.test(query.trim())
    setCreateId(looksLikeId ? query.trim() : '')
    setCreateName(looksLikeId ? '' : query.trim().toUpperCase())
    setCreateMode(true)
  }

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const id = createId.trim()
    const name = createName.trim()
    if (!id || !name) {
      toast.error('Documento y nombre son obligatorios')
      return
    }
    try {
      const doctor = await createMutation.mutateAsync({ id, name })
      onSelect(doctor)
      onClose()
      setCreateMode(false)
      setCreateId('')
      setCreateName('')
      setQuery('')
      toast.success(`Doctor ${doctor.name} registrado y seleccionado`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo registrar el doctor'
      toast.error(msg)
    }
  }

  if (!open) return null

  return (
    <>
      <div
        className="absolute inset-0 z-10 bg-[#2d3436]/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="absolute right-0 top-0 z-20 flex h-full w-[400px] flex-col bg-white"
        style={{ boxShadow: '-16px 0 40px -10px rgba(15, 23, 42, 0.18)' }}
        role="dialog"
        aria-label="Seleccionar doctor"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-[#2d3436]">
              {createMode ? 'Registrar doctor nuevo' : 'Seleccionar doctor'}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {createMode ? 'Documento y nombre completo' : 'Responsable de la prescripcion'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {!createMode ? (
          <>
            <div className="border-b border-slate-200 px-5 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre o documento..."
                  autoFocus
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-[#2d3436] placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {listQuery.isPending && (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Buscando doctores...
                </div>
              )}
              {!listQuery.isPending && doctors.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <UserRound className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Sin resultados</p>
                  <p className="max-w-[260px] text-xs text-slate-500">
                    {query.trim()
                      ? `No se encontró ningún doctor con "${query.trim()}". Creá uno nuevo abajo.`
                      : 'No hay doctores registrados todavía.'}
                  </p>
                </div>
              )}
              {!listQuery.isPending && doctors.length > 0 && (
                <ul className="flex flex-col gap-1 px-3">
                  {doctors.map((d) => {
                    const isSelected = selected?.id === d.id
                    return (
                      <li key={d.id}>
                        <button
                          type="button"
                          onClick={() => handlePick(d)}
                          className={`group flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition ${
                            isSelected
                              ? 'border-primary/20 bg-primary/10 ring-1 ring-primary/30'
                              : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                              isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {getInitials(d.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div
                              className={`truncate text-sm font-semibold ${
                                isSelected ? 'text-primary' : 'text-[#2d3436]'
                              }`}
                            >
                              {d.name}
                            </div>
                            <div
                              className={`font-mono text-xs ${
                                isSelected ? 'text-primary/70' : 'text-slate-500'
                              }`}
                            >
                              {d.id}
                            </div>
                          </div>
                          {isSelected ? (
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                              <Check className="h-3.5 w-3.5 text-white" />
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100">
                              Seleccionar
                              <ChevronRight className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div className="border-t border-slate-200 bg-slate-50/60 px-5 py-4">
              <button
                type="button"
                onClick={handleStartCreate}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Crear nuevo doctor
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmitCreate} className="flex flex-1 flex-col">
            <div className="flex-1 space-y-3 px-5 py-4">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Documento</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={createId}
                  onChange={(e) => setCreateId(e.target.value.replace(/\D/g, ''))}
                  placeholder="79481327"
                  autoFocus
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm text-[#2d3436] focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Nombre completo</span>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value.toUpperCase())}
                  placeholder="NOMBRES Y APELLIDOS"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm uppercase text-[#2d3436] focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
                />
              </label>
            </div>
            <div className="flex items-center gap-2 border-t border-slate-200 bg-slate-50/60 px-5 py-4">
              <button
                type="button"
                onClick={() => setCreateMode(false)}
                disabled={createMutation.isPending}
                className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || !createId.trim() || !createName.trim()}
                className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" /> Guardar y seleccionar
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </aside>
    </>
  )
}
