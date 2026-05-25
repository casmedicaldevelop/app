interface StaffStatusBadgeProps {
  isActive: boolean
}

export function StaffStatusBadge({ isActive }: StaffStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium
        ${isActive
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
          : 'bg-red-50 text-red-600 ring-1 ring-red-200'
        }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  )
}
