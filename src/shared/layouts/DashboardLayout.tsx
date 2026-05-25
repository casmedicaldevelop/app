import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import { useAuthStore } from '../../modules/auth/auth.store'
import { useLogout } from '../../modules/auth/hooks/useLogout'
import { renderIcon } from '@/modules/system-modules/components/IconPicker'

interface NavItem {
  path: string
  label: string
  icon: string
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { path: '/dashboard/employees', label: 'Personal', icon: 'UserCog' },
  { path: '/dashboard/modules', label: 'Módulos', icon: 'Boxes' },
  { path: '/dashboard/company', label: 'Empresa', icon: 'Building2' },
]

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .filter((w) => w.length > 0)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('') || '?'
  )
}

function useCurrentPage(items: NavItem[]) {
  const { pathname } = useLocation()
  return items.find((item) => pathname === item.path || pathname.startsWith(item.path + '/'))
}

function SidebarLink({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const { icon, path, label } = item
  return (
    <NavLink
      to={path}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150
         ${isActive
           ? 'bg-white/20 text-white shadow-sm'
           : 'text-white/60 hover:bg-white/10 hover:text-white'
         }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-white/80" />
          )}
          {renderIcon(icon, 'h-4 w-4 shrink-0')}
          <span className="flex-1">{label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function DashboardLayout() {
  const { user } = useAuthStore()
  const handleLogout = useLogout()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isAdmin = user?.role === 'ADMIN'
  const { pathname } = useLocation()
  const isFullBleedRoute = pathname.startsWith('/dashboard/mipres')

  const adminPaths = new Set(ADMIN_NAV_ITEMS.map((i) => i.path))
  const userModuleItems = (user?.modules ?? [])
    .filter((m) => !adminPaths.has(`/dashboard/${encodeURIComponent(m.name)}`))
    .map((m) => ({
      path: `/dashboard/${encodeURIComponent(m.name)}`,
      label: m.label,
      icon: m.icon,
    }))

  const currentPage = useCurrentPage([...userModuleItems, ...ADMIN_NAV_ITEMS])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex w-64 flex-col shrink-0
          transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: 'linear-gradient(180deg, #0F2363 0%, #1a3a8f 100%)' }}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center gap-3 px-5 border-b border-white/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 shrink-0">
            <span className="text-xs font-bold text-white">CM</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-tight">CASMEDICAL</p>
            <p className="text-[10px] text-white/50 leading-tight">Gestión administrativa</p>
          </div>
          <button
            className="lg:hidden p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Primary nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {userModuleItems.map((item) => (
            <SidebarLink key={item.path} item={item} onNavigate={() => setSidebarOpen(false)} />
          ))}
          {userModuleItems.length === 0 && !isAdmin && (
            <p className="px-3 py-2 text-xs text-white/30">Sin módulos asignados</p>
          )}

          {isAdmin && (
            <>
              <div className="pt-5 pb-2 px-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-white/10" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 shrink-0">Admin</p>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
              </div>
              {ADMIN_NAV_ITEMS.map((item) => (
                <SidebarLink key={item.path} item={item} onNavigate={() => setSidebarOpen(false)} />
              ))}
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                       text-white/50 hover:bg-red-500/20 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Right panel */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white shadow-sm px-4 sm:px-6">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 -ml-1 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Current page title */}
          <div className="flex items-center gap-2.5 min-w-0">
            {currentPage?.icon && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                {renderIcon(currentPage.icon, 'h-4 w-4 text-primary')}
              </div>
            )}
            <h1 className="text-base font-semibold text-slate-800 truncate">
              {currentPage?.label ?? 'Dashboard'}
            </h1>
          </div>

          <div className="flex-1" />

          {/* User info */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-medium text-slate-700 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-400 leading-tight">{user?.email}</p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {user ? getInitials(user.name) : '?'}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className={`flex-1 overflow-auto ${isFullBleedRoute ? '' : 'p-4 sm:p-6 lg:p-8'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
