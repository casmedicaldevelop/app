import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  Users, AlertCircle, RefreshCw, Eye,
  Upload, X, ChevronLeft, ChevronRight, Download, Plus, Copy, Check, SlidersHorizontal,
} from 'lucide-react'
import { toast } from 'sonner'
import { useServiceUsers } from '../hooks/useServiceUsers'
import { useToggleServiceUser } from '../hooks/useToggleServiceUser'
import { useBulkImport } from '../hooks/useBulkImport'
import { serviceUsersService } from '../services/service-users.service'
import type { BulkImportError, ServiceUser } from '../types/service-user.types'
import { composeFullName } from '../utils/user-name.utils'

const PAGE_SIZE = 20

function ServiceUserRow({ user }: { user: ServiceUser }) {
  const navigate = useNavigate()
  const toggle = useToggleServiceUser(user.id)

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors duration-100">
      <td className="px-4 py-3 sm:px-6 text-xs font-medium text-muted-foreground whitespace-nowrap">
        {user.documentType ?? <span className="text-muted-foreground/40">—</span>}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-foreground whitespace-nowrap">{user.id}</td>
      <td className="px-4 py-3 text-sm text-foreground max-w-[200px]">
        <span className="truncate block" title={composeFullName(user)}>{composeFullName(user)}</span>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums whitespace-nowrap hidden sm:table-cell">
        {user.phone}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
        {user.city ?? <span className="text-muted-foreground/40">—</span>}
      </td>
      <td className="px-4 py-3">
        <label
          className="relative inline-flex cursor-pointer items-center"
          aria-label={toggle.isPending ? 'Guardando...' : user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
        >
          <input
            type="checkbox"
            checked={user.isActive}
            onChange={() => toggle.mutate(!user.isActive)}
            disabled={toggle.isPending}
            className="sr-only peer"
          />
          <div className="h-5 w-9 rounded-full bg-muted-foreground/30 transition-colors duration-200
                          peer-checked:bg-primary peer-disabled:opacity-50
                          after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4
                          after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200
                          after:content-[''] peer-checked:after:translate-x-4" />
        </label>
      </td>
      <td className="px-4 py-3 sm:px-6 text-right">
        <button
          type="button"
          onClick={() => navigate(`/dashboard/usuarios/${encodeURIComponent(user.id)}`)}
          aria-label="Ver usuario"
          title="Ver usuario"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-input
                     cursor-pointer hover:bg-muted transition-all duration-150"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  )
}

function DuplicatesModal({ duplicates, onClose }: { duplicates: string[]; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(duplicates.join('\n')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm rounded-xl border border-border bg-background shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Importación cancelada</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {duplicates.length} cédula{duplicates.length !== 1 ? 's' : ''} ya registrada{duplicates.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-md flex items-center justify-center cursor-pointer hover:bg-muted transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Ningún registro fue importado. Corrija las siguientes cédulas en el archivo y vuelva a intentarlo:
          </p>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-muted/30 p-3 space-y-1">
            {duplicates.map((id) => (
              <p key={id} className="font-mono text-xs text-foreground">{id}</p>
            ))}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 h-8 rounded-lg border border-input
                       text-xs font-medium cursor-pointer hover:bg-muted transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copiado' : 'Copiar cédulas'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full h-8 rounded-lg bg-primary text-primary-foreground text-xs font-semibold
                       cursor-pointer hover:bg-primary/90 transition-all duration-200"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}

function BulkImportModal({ onClose }: { onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [duplicates, setDuplicates] = useState<string[] | null>(null)
  const bulkImport = useBulkImport()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null)
    setDuplicates(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setDuplicates(null)
    bulkImport.mutate(file, {
      onSuccess: () => { onClose() },
      onError: (err: unknown) => {
        const e = err as Partial<BulkImportError>
        if (e?.duplicates?.length) {
          setDuplicates(e.duplicates)
        } else {
          toast.error(e?.message ?? 'Error al procesar el archivo')
        }
      },
    })
  }

  if (duplicates) {
    return <DuplicatesModal duplicates={duplicates} onClose={() => { setDuplicates(null); onClose() }} />
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !bulkImport.isPending) onClose() }}
    >
      <div className="w-full max-w-sm rounded-xl border border-border bg-background shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Importación masiva</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Archivo Excel (.xlsx)</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={bulkImport.isPending}
            className="h-7 w-7 rounded-md flex items-center justify-center cursor-pointer hover:bg-muted transition-colors disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Archivo</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input
                         px-4 py-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30
                         transition-all duration-150"
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
              {file ? (
                <div>
                  <p className="text-xs font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-medium text-foreground">Seleccionar archivo</p>
                  <p className="text-xs text-muted-foreground">.xlsx — máx. 10 MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => serviceUsersService.downloadTemplate()}
              className="mt-2.5 w-full flex items-center justify-center gap-2 h-8 rounded-lg
                         border border-emerald-300 bg-emerald-50 text-xs font-medium
                         text-emerald-700 cursor-pointer hover:bg-emerald-100 hover:border-emerald-400
                         active:scale-[0.99] transition-all duration-150"
            >
              <Download className="h-3.5 w-3.5 shrink-0" />
              Descargar plantilla (.xlsx)
            </button>
          </div>

          <p className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Si alguna cédula ya está registrada, la importación completa se cancela y se informan las cédulas duplicadas.
          </p>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={bulkImport.isPending}
              className="flex-1 h-8 rounded-lg border border-input text-xs font-medium cursor-pointer
                         hover:bg-muted disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!file || bulkImport.isPending}
              className="flex-1 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-semibold
                         cursor-pointer hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98]
                         transition-all duration-200 shadow-sm"
            >
              {bulkImport.isPending ? 'Importando...' : 'Importar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

type StatusFilter = 'all' | 'active' | 'inactive'

function UsersFiltersDrawer({
  open,
  search,
  city,
  status,
  onClose,
  onApply,
}: {
  open: boolean
  search: string
  city: string
  status: StatusFilter
  onClose: () => void
  onApply: (v: { search: string; city: string; status: StatusFilter }) => void
}) {
  const [s, setS] = useState(search)
  const [c, setC] = useState(city)
  const [st, setSt] = useState<StatusFilter>(status)

  useEffect(() => {
    if (open) { setS(search); setC(city); setSt(status) }
  }, [open, search, city, status])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])

  if (!open) return null

  const INPUT =
    'h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors'
  const LABEL = 'mb-1 block text-xs font-medium text-foreground'

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 bg-[#2d3436]/40" onClick={onClose} aria-hidden="true" />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col bg-background shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Filtrar usuarios"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Filtrar usuarios</h2>
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

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <div>
            <label className={LABEL}>Buscar por cédula o nombre</label>
            <input type="text" value={s} onChange={(e) => setS(e.target.value)} placeholder="Cédula o nombre..." className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Ciudad</label>
            <input type="text" value={c} onChange={(e) => setC(e.target.value)} placeholder="Filtrar por ciudad..." className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Estado</label>
            <select value={st} onChange={(e) => setSt(e.target.value as StatusFilter)} className={`${INPUT} cursor-pointer`}>
              <option value="all">Todos</option>
              <option value="active">Solo activos</option>
              <option value="inactive">Solo inactivos</option>
            </select>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 border-t border-border bg-muted/30 px-5 py-4">
          <button
            type="button"
            onClick={() => { setS(''); setC(''); setSt('all') }}
            className="h-9 flex-1 cursor-pointer rounded-lg border border-input px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={() => onApply({ search: s, city: c, status: st })}
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

export default function ServiceUsersListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [showBulk, setShowBulk] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const isActiveParam = statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined

  const { data, isLoading, isError, refetch } = useServiceUsers({
    page,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
    city: cityFilter.trim() || undefined,
    isActive: isActiveParam,
  })

  const users = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0
  const activeFilters =
    (search.trim() ? 1 : 0) + (cityFilter.trim() ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)

  return (
    <div className="flex min-h-full flex-col bg-background md:h-full">
      {/* Header */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-border bg-background px-4 py-4 sm:px-6">
        <div>
          <h1 className="font-heading text-lg font-bold leading-tight text-foreground">Usuarios</h1>
          {!isLoading && !isError && (
            <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
              {total} usuario{total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowBulk(true)}
            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-input px-3 text-xs font-medium transition-all duration-150 hover:bg-muted"
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Importar</span>
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-input px-3 text-xs font-medium transition-all duration-150 hover:bg-muted"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filtros</span>
            {activeFilters > 0 && (
              <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {activeFilters}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/usuarios/nuevo')}
            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Nuevo usuario</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 sm:px-6">
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="h-3 flex-1 animate-pulse rounded bg-muted" />
                <div className="hidden h-3 w-20 animate-pulse rounded bg-muted sm:block" />
                <div className="hidden h-3 w-16 animate-pulse rounded bg-muted md:block" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                <div className="h-5 w-9 animate-pulse rounded-full bg-muted" />
                <div className="h-7 w-16 animate-pulse rounded-md bg-muted" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <AlertCircle className="h-8 w-8 text-destructive/60" />
            <div>
              <p className="text-sm font-medium text-foreground">Error al cargar usuarios</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Verifica tu conexión e inténtalo de nuevo</p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-input px-3 text-xs font-medium transition-all duration-150 hover:bg-muted"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reintentar
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <Users className="h-8 w-8 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {activeFilters > 0 ? 'Sin resultados' : 'Sin usuarios'}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {activeFilters > 0
                  ? 'Ajusta los filtros para ver usuarios'
                  : 'Registra el primer usuario o realiza una importación masiva'}
              </p>
            </div>
            {activeFilters === 0 && (
              <button
                type="button"
                onClick={() => navigate('/dashboard/usuarios/nuevo')}
                className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition-all duration-150 hover:bg-primary/90"
              >
                <Plus className="h-3.5 w-3.5" />
                Registrar primer usuario
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap sm:px-6">Tipo doc.</th>
                    <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Cédula</th>
                    <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nombre</th>
                    <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell whitespace-nowrap">Teléfono</th>
                    <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Ciudad</th>
                    <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activo</th>
                    <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:px-6" />
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <ServiceUserRow key={user.id} user={user} />
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border bg-muted/10 px-4 py-3 sm:px-6">
                <p className="text-xs text-muted-foreground tabular-nums">
                  Página {page} de {totalPages}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-input transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-input transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Página siguiente"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <UsersFiltersDrawer
        open={showFilters}
        search={search}
        city={cityFilter}
        status={statusFilter}
        onClose={() => setShowFilters(false)}
        onApply={(v) => {
          setSearch(v.search)
          setCityFilter(v.city)
          setStatusFilter(v.status)
          setPage(1)
          setShowFilters(false)
        }}
      />
      {showBulk && <BulkImportModal onClose={() => setShowBulk(false)} />}
    </div>
  )
}
