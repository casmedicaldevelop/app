import { useState } from 'react'
import {
  LayoutDashboard, Users, UserCog, ShoppingCart, Package, BarChart3, Settings,
  Boxes, FileText, Truck, Hospital, Pill, Activity, ClipboardList,
  DollarSign, TrendingUp, MapPin, Phone, Mail, Building2, Stethoscope,
  FlaskConical, Heart, Shield, Star, Bell, Calendar, Clock, Search,
  ChevronRight, ArrowRight, type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard, Users, UserCog, ShoppingCart, Package, BarChart3, Settings,
  Boxes, FileText, Truck, Hospital, Pill, Activity, ClipboardList,
  DollarSign, TrendingUp, MapPin, Phone, Mail, Building2, Stethoscope,
  FlaskConical, Heart, Shield, Star, Bell, Calendar, Clock, Search,
  ChevronRight, ArrowRight,
}

interface IconPickerProps {
  value: string
  onChange: (name: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [filter, setFilter] = useState('')

  const filtered = Object.entries(ICONS).filter(([name]) =>
    name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Buscar icono..."
          className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm
                     focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                     transition-colors"
        />
      </div>
      <div className="grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto rounded-lg border border-border p-2">
        {filtered.map(([name, Icon]) => (
          <button
            key={name}
            type="button"
            title={name}
            onClick={() => onChange(name)}
            className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs transition-colors
              ${value === name
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-6 text-center text-xs text-muted-foreground py-3">
            Sin resultados
          </p>
        )}
      </div>
      {value && (
        <p className="text-xs text-muted-foreground">
          Seleccionado: <span className="font-medium text-foreground">{value}</span>
        </p>
      )}
    </div>
  )
}

export function renderIcon(name: string, className?: string) {
  const Icon = ICONS[name]
  if (!Icon) return null
  return <Icon className={className ?? 'h-5 w-5'} />
}
