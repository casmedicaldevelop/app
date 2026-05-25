import type { Role } from '../../auth/types/auth.types'

interface RoleBadgeProps {
  role: Role
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold
        ${role === 'ADMIN'
          ? 'bg-primary/10 text-primary'
          : 'bg-muted text-muted-foreground'
        }`}
    >
      {role === 'ADMIN' ? 'Admin' : 'Auxiliar'}
    </span>
  )
}
