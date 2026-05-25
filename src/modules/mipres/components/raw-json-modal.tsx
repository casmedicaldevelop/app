import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Copy, X } from 'lucide-react'
import { toast } from 'sonner'

interface RawJsonModalProps {
  title: string
  data: unknown
  onClose: () => void
}

export default function RawJsonModal({ title, data, onClose }: RawJsonModalProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const json = JSON.stringify(data, null, 2)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
      toast.success('JSON copiado al portapapeles')
    } catch {
      toast.error('No se pudo copiar al portapapeles')
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3">
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus:ring-[3px] focus:ring-primary/25"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-slate-950 p-4">
          <pre className="whitespace-pre font-mono text-[12.5px] leading-relaxed text-slate-100">
            {json}
          </pre>
        </div>
      </div>
    </div>,
    document.body,
  )
}
