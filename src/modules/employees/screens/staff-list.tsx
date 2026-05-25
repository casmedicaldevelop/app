import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, UserPlus, ChevronLeft, ChevronRight, Users, AlertCircle, RefreshCw, AlertTriangle } from 'lucide-react'
import { useStaffList } from '../hooks/useStaffList'
import { StaffStatusBadge } from '../components/StaffStatusBadge'
import { RoleBadge } from '../components/RoleBadge'
import type { Role } from '../../auth/types/auth.types'

type StatusFilter = 'all' | 'active' | 'inactive'

export default function StaffListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | ''>('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const isActiveParam =
    statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined

  const { data, isLoading, isError, refetch } = useStaffList({
    page,
    limit: 20,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(roleFilter && { role: roleFilter }),
    ...(isActiveParam !== undefined && { isActive: isActiveParam }),
  })

  const handleFilterChange = (updater: () => void) => {
    updater()
    setPage(1)
  }

  return (
    <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">

      {/* Panel header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h1 className="text-base font-semibold text-foreground">Personal</h1>
          {!isLoading && !isError && data && (
            <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
              {data.total} miembro{data.total !== 1 ? 's' : ''} en total
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigate('/dashboard/employees/nuevo')}
          className="flex items-center gap-2 h-8 px-3.5 rounded-lg bg-primary text-xs font-semibold
                     text-primary-foreground cursor-pointer hover:bg-primary/90 active:scale-[0.98]
                     transition-all duration-200 shadow-sm shrink-0"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Nuevo personal</span>
        </button>
      </div>

      {/* Toolbar: search + filters */}
      <div className="flex flex-col sm:flex-row gap-2 px-6 py-3 border-b border-border bg-muted/20">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o usuario..."
            className="h-7 w-full rounded-md border border-input bg-background pl-9 pr-3 text-xs
                       focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30
                       transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sf-status-filter" className="text-xs text-muted-foreground whitespace-nowrap">
            Estado:
          </label>
          <select
            id="sf-status-filter"
            value={statusFilter}
            onChange={(e) => handleFilterChange(() => setStatusFilter(e.target.value as StatusFilter))}
            className="h-7 rounded-md border border-input bg-background px-2.5 text-xs cursor-pointer
                       hover:border-ring/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30
                       transition-colors"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <label htmlFor="sf-role-filter" className="text-xs text-muted-foreground whitespace-nowrap">
            Rol:
          </label>
          <select
            id="sf-role-filter"
            value={roleFilter}
            onChange={(e) => handleFilterChange(() => setRoleFilter(e.target.value as Role | ''))}
            className="h-7 rounded-md border border-input bg-background px-2.5 text-xs cursor-pointer
                       hover:border-ring/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30
                       transition-colors"
          >
            <option value="">Todos</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">Auxiliar</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-3.5">
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-36 bg-muted animate-pulse rounded" />
                <div className="h-3 w-48 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-3.5 w-20 bg-muted animate-pulse rounded hidden sm:block" />
              <div className="h-5 w-16 bg-muted animate-pulse rounded-full hidden sm:block" />
              <div className="h-5 w-14 bg-muted animate-pulse rounded-full" />
              <div className="h-3.5 w-16 bg-muted animate-pulse rounded hidden md:block" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-destructive/60" />
          <div>
            <p className="text-sm font-medium text-foreground">Error al cargar el personal</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Verifica tu conexión e inténtalo de nuevo</p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-input text-xs font-medium
                       cursor-pointer hover:bg-muted transition-all duration-150"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar
          </button>
        </div>
      ) : data?.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
          <Users className="h-8 w-8 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {debouncedSearch ? 'Sin resultados para tu búsqueda' : 'No hay personal registrado'}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {debouncedSearch ? 'Intenta con otros términos o cambia los filtros' : 'Crea el primer miembro del personal'}
            </p>
          </div>
          {!debouncedSearch && statusFilter === 'all' && !roleFilter && (
            <button
              type="button"
              onClick={() => navigate('/dashboard/employees/nuevo')}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground
                         text-xs font-semibold cursor-pointer hover:bg-primary/90 transition-all duration-150"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Crear primer personal
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th scope="col" className="px-6 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Personal
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    Username
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Rol
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Estado
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell whitespace-nowrap">
                    Módulos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.data.map((member) => (
                  <tr
                    key={member.id}
                    onClick={() => navigate(`/dashboard/employees/${member.id}`)}
                    className="cursor-pointer hover:bg-muted/20 transition-colors duration-100"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {member.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-foreground text-sm leading-tight">{member.name}</span>
                            {member.mustChangePassword && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200 shrink-0">
                                <AlertTriangle className="h-2.5 w-2.5" />
                                Cambio requerido
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{member.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-muted-foreground font-mono">@{member.username}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <RoleBadge role={member.role} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StaffStatusBadge isActive={member.isActive} />
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {member.modules.length} módulo{member.modules.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="sm:hidden divide-y divide-border">
            {data?.data.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => navigate(`/dashboard/employees/${member.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/20 transition-colors cursor-pointer"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {member.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-foreground text-sm truncate">{member.name}</span>
                    {member.mustChangePassword && (
                      <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" aria-label="Cambio de contraseña requerido" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground truncate">{member.email}</span>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <RoleBadge role={member.role} />
                  <StaffStatusBadge isActive={member.isActive} />
                </div>
              </button>
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-6 py-3 bg-muted/20">
              <p className="text-xs text-muted-foreground tabular-nums">
                Página {data.page} de {data.totalPages} · {data.total} total
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 h-7 px-2.5 rounded-md border border-input text-xs
                             cursor-pointer hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed
                             transition-all duration-150"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page >= data.totalPages}
                  className="flex items-center gap-1 h-7 px-2.5 rounded-md border border-input text-xs
                             cursor-pointer hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed
                             transition-all duration-150"
                >
                  Siguiente
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
