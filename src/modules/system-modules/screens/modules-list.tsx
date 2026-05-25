import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Boxes, AlertCircle, RefreshCw, Pencil, Users, Trash2, GripVertical } from 'lucide-react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useModules } from '../hooks/useModules'
import { useUpdateModule } from '../hooks/useUpdateModule'
import { useDeleteModule } from '../hooks/useDeleteModule'
import { useReorderModules } from '../hooks/useReorderModules'
import { renderIcon } from '../components/IconPicker'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import type { SystemModule } from '../types/modules.types'

type StatusFilter = 'all' | 'active' | 'inactive'

interface ModuleRowProps {
  module: SystemModule
  isDragEnabled: boolean
}

function ModuleRow({ module, isDragEnabled }: ModuleRowProps) {
  const navigate = useNavigate()
  const updateMutation = useUpdateModule(module.id)
  const deleteMutation = useDeleteModule()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: isDragging ? 'relative' : undefined,
    zIndex: isDragging ? 1 : undefined,
  }

  function handleDeleteConfirm() {
    deleteMutation.mutate(module.id, { onSettled: () => setConfirmOpen(false) })
  }

  return (
    <>
      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar módulo"
        description={`¿Estás seguro de que deseas eliminar "${module.label}"? Esta acción no se puede deshacer.`}
        warning={
          module.assignedUsersCount > 0
            ? `Este módulo está asignado a ${module.assignedUsersCount} personal. Al eliminarlo se removerá el acceso a todos ellos.`
            : undefined
        }
        confirmLabel="Eliminar"
        destructive
        isPending={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
      <tr
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors duration-100"
      >
        {/* Drag handle column */}
        <td className="pl-3 pr-1 py-3.5 w-8">
          {isDragEnabled && (
            <button
              type="button"
              {...listeners}
              aria-label="Arrastrar para reordenar"
              className="flex items-center justify-center h-6 w-6 rounded text-muted-foreground/40
                         hover:text-muted-foreground hover:bg-muted cursor-grab active:cursor-grabbing
                         transition-colors duration-100 touch-none"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}
        </td>

        {/* Module name + icon */}
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                ${module.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
            >
              {renderIcon(module.icon, 'h-4 w-4')}
            </div>
            <div className="min-w-0">
              <span className="text-sm font-medium text-foreground">{module.label}</span>
              <p className="text-xs text-muted-foreground font-mono">{module.name}</p>
            </div>
          </div>
        </td>

        {/* Users count */}
        <td className="px-4 py-3.5 hidden md:table-cell">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span className="tabular-nums">
              <span className="font-semibold text-foreground">{module.assignedUsersCount}</span>
              {' '}personal
            </span>
          </div>
        </td>

        {/* Status badge */}
        <td className="px-4 py-3.5">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap
              ${module.isActive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-muted text-muted-foreground border border-border'
              }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full shrink-0 ${module.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/60'}`}
            />
            {module.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </td>

        {/* Active toggle */}
        <td className="px-4 py-3.5">
          <label
            className="relative inline-flex cursor-pointer items-center"
            aria-label={updateMutation.isPending ? 'Guardando...' : module.isActive ? 'Desactivar módulo' : 'Activar módulo'}
          >
            <input
              type="checkbox"
              checked={module.isActive}
              onChange={() => updateMutation.mutate({ isActive: !module.isActive })}
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
        </td>

        {/* Actions */}
        <td className="px-4 py-3.5 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/modules/${module.id}/edit`)}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-input text-xs font-medium
                         cursor-pointer hover:bg-muted transition-all duration-150"
            >
              <Pencil className="h-3 w-3" />
              Editar
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              aria-label="Eliminar módulo"
              className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-input text-xs
                         cursor-pointer hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive
                         text-muted-foreground transition-all duration-150"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </td>
      </tr>
    </>
  )
}

export default function ModulesListPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const { data: allModules = [], isLoading, isError, refetch } = useModules()
  const reorderMutation = useReorderModules()

  const [localOrder, setLocalOrder] = useState<SystemModule[]>([])
  const prevOrderRef = useRef<SystemModule[]>([])

  useEffect(() => {
    setLocalOrder(allModules)
  }, [allModules])

  const isDragEnabled = statusFilter === 'all'

  const visible =
    statusFilter === 'active'
      ? localOrder.filter((m) => m.isActive)
      : statusFilter === 'inactive'
        ? localOrder.filter((m) => !m.isActive)
        : localOrder

  const activeCount = allModules.filter((m) => m.isActive).length
  const inactiveCount = allModules.filter((m) => !m.isActive).length

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = localOrder.findIndex((m) => m.id === active.id)
    const newIndex = localOrder.findIndex((m) => m.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    prevOrderRef.current = localOrder
    const reordered = arrayMove(localOrder, oldIndex, newIndex)
    setLocalOrder(reordered)

    reorderMutation.mutate(reordered.map((m) => m.id), {
      onError: () => {
        setLocalOrder(prevOrderRef.current)
      },
    })
  }

  return (
    <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">

      {/* Panel header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h1 className="text-base font-semibold text-foreground">Módulos</h1>
          {!isLoading && !isError && (
            <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
              {allModules.length} total
              {' · '}
              <span className="text-emerald-600 font-medium">{activeCount} activo{activeCount !== 1 ? 's' : ''}</span>
              {' · '}
              {inactiveCount} inactivo{inactiveCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigate('/dashboard/modules/new')}
          className="flex items-center gap-2 h-8 px-3.5 rounded-lg bg-primary text-xs font-semibold
                     text-primary-foreground cursor-pointer hover:bg-primary/90 active:scale-[0.98]
                     transition-all duration-200 shadow-sm shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Nuevo módulo</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-2.5 border-b border-border bg-muted/20">
        <label htmlFor="mod-status-filter" className="text-xs text-muted-foreground whitespace-nowrap">
          Estado:
        </label>
        <select
          id="mod-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="h-7 rounded-md border border-input bg-background px-2.5 text-xs cursor-pointer
                     hover:border-ring/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30
                     transition-colors"
        >
          <option value="all">Todos</option>
          <option value="active">Solo activos</option>
          <option value="inactive">Solo inactivos</option>
        </select>
        {!isLoading && !isError && statusFilter !== 'all' && (
          <span className="text-xs text-muted-foreground tabular-nums ml-auto">
            {visible.length} resultado{visible.length !== 1 ? 's' : ''}
          </span>
        )}
        {isDragEnabled && !isLoading && !isError && localOrder.length > 1 && (
          <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
            <GripVertical className="h-3 w-3" />
            Arrastra para reordenar
          </span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-3.5">
              <div className="h-8 w-8 rounded-lg bg-muted animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-28 bg-muted animate-pulse rounded" />
                <div className="h-3 w-16 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-4 w-16 bg-muted animate-pulse rounded hidden md:block" />
              <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
              <div className="h-5 w-9 bg-muted animate-pulse rounded-full" />
              <div className="h-7 w-14 bg-muted animate-pulse rounded-md" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-destructive/60" />
          <div>
            <p className="text-sm font-medium text-foreground">Error al cargar módulos</p>
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
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
          <Boxes className="h-8 w-8 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {statusFilter === 'all' ? 'Sin módulos' : `No hay módulos ${statusFilter === 'active' ? 'activos' : 'inactivos'}`}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {statusFilter === 'all' ? 'Crea el primer módulo del sistema' : 'Cambia el filtro para ver otros módulos'}
            </p>
          </div>
          {statusFilter === 'all' && (
            <button
              type="button"
              onClick={() => navigate('/dashboard/modules/new')}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground
                         text-xs font-semibold cursor-pointer hover:bg-primary/90 transition-all duration-150"
            >
              <Plus className="h-3.5 w-3.5" />
              Crear primer módulo
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th scope="col" className="w-8 pl-3 pr-1 py-2.5" aria-label="Orden" />
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Módulo
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell whitespace-nowrap">
                    Personal
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    Estado
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    Activo
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground" />
                </tr>
              </thead>
              <SortableContext items={visible.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {visible.map((module) => (
                    <ModuleRow key={module.id} module={module} isDragEnabled={isDragEnabled} />
                  ))}
                </tbody>
              </SortableContext>
            </table>
          </DndContext>
        </div>
      )}
    </div>
  )
}
