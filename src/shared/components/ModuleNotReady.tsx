import { Construction } from 'lucide-react'

export default function ModuleNotReady() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 text-slate-400">
      <Construction className="h-12 w-12 opacity-40" />
      <p className="text-lg font-medium">Módulo en construcción</p>
      <p className="text-sm">Este módulo estará disponible próximamente.</p>
    </div>
  )
}
