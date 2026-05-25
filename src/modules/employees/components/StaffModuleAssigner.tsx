import { useModules } from '../../system-modules/hooks/useModules'
import { useAssignStaffModules } from '../hooks/useAssignStaffModules'
import { renderIcon } from '../../system-modules/components/IconPicker'
import type { UserModule } from '../../auth/types/auth.types'

interface StaffModuleAssignerProps {
  staffMemberId: string
  assignedModules: UserModule[]
}

export function StaffModuleAssigner({ staffMemberId, assignedModules }: StaffModuleAssignerProps) {
  const { data: allModules = [], isLoading } = useModules({ isActive: true })
  const mutation = useAssignStaffModules(staffMemberId)

  const assignedIds = new Set(assignedModules.map((m) => m.name))

  const toggle = (moduleName: string, moduleId: string) => {
    let next: string[]
    if (assignedIds.has(moduleName)) {
      const currentIds = allModules
        .filter((m) => assignedIds.has(m.name) && m.name !== moduleName)
        .map((m) => m.id)
      next = currentIds
    } else {
      const currentIds = allModules.filter((m) => assignedIds.has(m.name)).map((m) => m.id)
      next = [...currentIds, moduleId]
    }
    mutation.mutate(next)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {allModules.map((mod) => {
          const isAssigned = assignedIds.has(mod.name)
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => toggle(mod.name, mod.id)}
              disabled={mutation.isPending}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium
                transition-colors text-left
                cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                ${isAssigned
                  ? 'border-primary/40 bg-primary/5 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors
                  ${isAssigned ? 'border-primary bg-primary' : 'border-muted-foreground/40'}`}
              >
                {isAssigned && (
                  <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5.5L4 8L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center ${isAssigned ? 'text-primary' : 'text-muted-foreground'}`}>
                {renderIcon(mod.icon, 'h-3.5 w-3.5')}
              </span>
              <span className="flex-1 truncate">{mod.label}</span>
            </button>
          )
        })}
      </div>
      {allModules.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No hay módulos activos disponibles
        </p>
      )}
    </div>
  )
}
