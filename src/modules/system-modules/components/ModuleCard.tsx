import { Pencil, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUpdateModule } from '../hooks/useUpdateModule'
import { renderIcon } from './IconPicker'
import type { SystemModule } from '../types/modules.types'

interface ModuleCardProps {
  module: SystemModule
}

export function ModuleCard({ module }: ModuleCardProps) {
  const navigate = useNavigate()
  const updateMutation = useUpdateModule(module.id)

  const toggleActive = () => {
    updateMutation.mutate({ isActive: !module.isActive })
  }

  return (
    <div
      className={`rounded-xl border bg-background flex flex-col transition-all duration-200
        ${module.isActive
          ? 'border-border shadow-sm hover:shadow-md hover:border-primary/25'
          : 'border-border shadow-sm opacity-60 hover:opacity-80'
        }`}
    >
      {/* Body */}
      <div className="p-5 flex flex-col gap-4 flex-1">

        {/* Icon row */}
        <div className="flex items-start justify-between gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors
              ${module.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
          >
            {renderIcon(module.icon, 'h-6 w-6')}
          </div>

          <div className="flex items-center gap-1.5 mt-0.5">
            {module.displayOrder > 0 && (
              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                #{module.displayOrder}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold
                ${module.isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-muted text-muted-foreground border border-border'
                }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${module.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/60'}`}
              />
              {module.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        {/* Name + slug + description */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground leading-snug">{module.label}</p>
          <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{module.name}</p>
          {module.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
              {module.description}
            </p>
          )}
        </div>

        {/* Users count */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span>
            <span className="font-semibold text-foreground">{module.assignedUsersCount}</span>
            {' '}usuario{module.assignedUsersCount !== 1 ? 's' : ''} asignado{module.assignedUsersCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-5 py-3 border-t border-border bg-muted/20 rounded-b-xl">
        <label
          className="relative inline-flex cursor-pointer items-center shrink-0"
          aria-label={module.isActive ? 'Desactivar módulo' : 'Activar módulo'}
        >
          <input
            type="checkbox"
            checked={module.isActive}
            onChange={toggleActive}
            disabled={updateMutation.isPending}
            className="sr-only peer"
          />
          <div
            className="h-5 w-9 rounded-full bg-muted-foreground/30 transition-colors duration-200
                        peer-checked:bg-primary peer-disabled:opacity-50
                        after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4
                        after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200
                        after:content-[''] peer-checked:after:translate-x-4"
          />
        </label>

        <span className="flex-1 text-xs text-muted-foreground select-none truncate">
          {updateMutation.isPending
            ? 'Guardando...'
            : module.isActive ? 'Desactivar' : 'Activar'}
        </span>

        <button
          type="button"
          onClick={() => navigate(`/dashboard/modules/${module.id}/edit`)}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-input text-xs font-medium
                     cursor-pointer hover:bg-muted hover:border-ring/50 active:scale-[0.97] transition-all shrink-0"
        >
          <Pencil className="h-3 w-3" />
          Editar
        </button>
      </div>
    </div>
  )
}
