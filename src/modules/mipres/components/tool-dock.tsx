import {
  Boxes,
  ClipboardList,
  Clock,
  FileText,
  Layers,
  Link2,
  List,
  MoreHorizontal,
  Package,
  Receipt,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { MipresTool } from '../types/shared.types'

interface ToolDockProps {
  enabled: boolean
  activeTool: MipresTool
  onToolChange: (tool: MipresTool) => void
}

interface ToolDef {
  id: MipresTool
  label: string
  icon: ComponentType<{ className?: string }>
}

interface PlaceholderDef {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
  caption?: string
}

const PRIMARY_TOOLS: ToolDef[] = [
  { id: 'routings', label: 'Direccionamientos', icon: List },
  { id: 'schedules', label: 'Programaciones', icon: Link2 },
  { id: 'entregas', label: 'Entregas', icon: Package },
  { id: 'delivery-reports', label: 'R. Entrega', icon: FileText },
  { id: 'facturacion', label: 'Facturación', icon: Receipt },
]

const FUTURE_TOOLS: PlaceholderDef[] = [
  { id: 'despacho', label: 'Despacho', icon: Boxes },
  { id: 'despacho-fases', label: 'Despacho por fases', icon: Layers },
  { id: 'reportes', label: 'Reportes', icon: ClipboardList },
  { id: 'turnos', label: 'Turnos', icon: Clock },
  { id: 'mas', label: '… +33', icon: MoreHorizontal, caption: 'Más herramientas según las vayas pidiendo' },
]

export default function ToolDock({ enabled, activeTool, onToolChange }: ToolDockProps) {
  return (
    <aside className="shrink-0 border-b border-slate-200 bg-white md:w-[200px] md:border-b-0 md:border-r md:overflow-y-auto xl:w-[220px]">
      {/* Mobile (<md): horizontal scroll strip with only primary tools.
          Aside flows in the parent's single scroll container. */}
      <div className="flex gap-2 overflow-x-auto px-3 py-2 md:hidden">
        {PRIMARY_TOOLS.map((tool) => (
          <MobileToolButton
            key={tool.id}
            tool={tool}
            disabled={!enabled}
            isActive={activeTool === tool.id && enabled}
            onClick={() => onToolChange(tool.id)}
          />
        ))}
      </div>

      {/* Desktop (md+): full vertical dock with primary + placeholders.
          Aside has its own overflow-y-auto so long lists scroll inside. */}
      <div className="hidden md:flex md:flex-col md:gap-1 md:p-2.5">
        <div className="px-2.5 pb-1 pt-1.5 text-[10.5px] font-bold uppercase tracking-widest text-slate-400">
          Herramientas
        </div>
        {PRIMARY_TOOLS.map((tool) => (
          <ToolButton
            key={tool.id}
            tool={tool}
            disabled={!enabled}
            isActive={activeTool === tool.id && enabled}
            onClick={() => onToolChange(tool.id)}
          />
        ))}

        <div className="mt-3 px-2.5 pb-1 pt-1.5 text-[10.5px] font-bold uppercase tracking-widest text-slate-400">
          Próximas
        </div>
        {FUTURE_TOOLS.map((tool) => (
          <PlaceholderButton key={tool.id} tool={tool} />
        ))}
      </div>
    </aside>
  )
}

interface ToolButtonProps {
  tool: ToolDef
  disabled: boolean
  isActive: boolean
  onClick: () => void
}

function ToolButton({ tool, disabled, isActive, onClick }: ToolButtonProps) {
  const Icon = tool.icon
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex min-h-[40px] cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] font-medium transition-colors',
        isActive
          ? 'bg-primary/10 font-bold text-primary'
          : 'text-slate-700 hover:bg-slate-100',
        disabled ? 'cursor-not-allowed opacity-55 hover:bg-transparent' : '',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
          isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600',
        ].join(' ')}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="truncate">{tool.label}</span>
    </button>
  )
}

function MobileToolButton({ tool, disabled, isActive, onClick }: ToolButtonProps) {
  const Icon = tool.icon
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors',
        isActive
          ? 'bg-primary text-white'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
        disabled ? 'cursor-not-allowed opacity-55' : '',
      ].join(' ')}
    >
      <Icon className="h-3.5 w-3.5" />
      {tool.label}
    </button>
  )
}

function PlaceholderButton({ tool }: { tool: PlaceholderDef }) {
  const Icon = tool.icon
  return (
    <button
      type="button"
      disabled
      title={tool.caption ?? 'Esta herramienta llega cuando la pidas en una próxima slice'}
      className="flex min-h-[40px] cursor-not-allowed items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] font-medium text-slate-700 opacity-55"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="truncate">{tool.label}</span>
      <span className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-bold tracking-wider text-slate-400">
        +
      </span>
    </button>
  )
}
