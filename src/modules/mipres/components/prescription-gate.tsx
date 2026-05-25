import { Search, FileText, X } from 'lucide-react'

interface PrescriptionGateProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  loading: boolean
  loaded: string | null
  onClear: () => void
}

export default function PrescriptionGate({
  value,
  onChange,
  onSubmit,
  loading,
  loaded,
  onClear,
}: PrescriptionGateProps) {
  if (loaded) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white">
        <FileText className="h-3.5 w-3.5" />
        <span className="font-mono text-[13px]">{loaded}</span>
        <button
          type="button"
          onClick={onClear}
          title="Limpiar prescripción"
          aria-label="Limpiar prescripción"
          className="flex cursor-pointer items-center justify-center rounded-full p-0.5 text-white/85 hover:bg-white/15 hover:text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit()
        }}
        placeholder="Nº de prescripción"
        autoComplete="off"
        spellCheck={false}
        className="h-10 w-56 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading || !value.trim()}
        className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Search className="h-4 w-4" />
        {loading ? 'Cargando...' : 'Cargar'}
      </button>
    </div>
  )
}
