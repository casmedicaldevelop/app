import { AlertCircle, AlertTriangle, Info, Pencil, UserPlus } from 'lucide-react'
import { composeFullName } from '../../users/utils/user-name.utils'
import type { WorkspaceResponse } from '../types/shared.types'

interface PatientContextBarProps {
  workspace: WorkspaceResponse | null
  error: string | null
  onEditPatient?: () => void
}

function getInitials(firstName: string, firstSurname: string): string {
  return (firstName.charAt(0) + firstSurname.charAt(0)).toUpperCase()
}

export default function PatientContextBar({ workspace, error, onEditPatient }: PatientContextBarProps) {
  if (error) {
    return (
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-3">
        <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
        <div className="text-sm text-red-600">{error}</div>
      </div>
    )
  }

  if (!workspace) return null

  if (workspace.routings.length === 0) {
    return (
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-3">
        <Info className="h-5 w-5 shrink-0 text-slate-500" />
        <div className="text-sm text-slate-600">
          Prescripción <span className="font-mono font-semibold">{workspace.prescriptionNumber}</span> sin direccionamientos
        </div>
      </div>
    )
  }

  if (!workspace.patient) return null

  if (workspace.patient.exists === false) {
    const { fromMipres } = workspace.patient
    return (
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-4 border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
          <UserPlus className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-slate-900">Paciente nuevo</div>
          <div className="text-xs text-slate-500">
            {fromMipres.tipoDoc} {fromMipres.noDoc} · {fromMipres.address}
          </div>
        </div>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
          <AlertTriangle className="h-3 w-3" />
          Sin registrar
        </span>
      </div>
    )
  }

  const u = workspace.patient.user
  const initials = getInitials(u.firstName, u.firstSurname)
  const tipoDoc = workspace.routings[0]?.TipoIDPaciente ?? 'CC'

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-4 border-b border-slate-200 bg-white px-6 py-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-base font-bold text-white">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-slate-900">{composeFullName(u)}</div>
        <div className="text-xs text-slate-500">
          {tipoDoc} {u.id}
        </div>
      </div>
      {onEditPatient && (
        <button
          type="button"
          onClick={onEditPatient}
          aria-label="Editar paciente"
          title="Editar paciente"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors duration-150 hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
