import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, X } from 'lucide-react'
import type { EntregaItem } from '../types/deliveries.types'

interface ConfirmCancelDeliveryModalProps {
  delivery: EntregaItem
  loading: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmCancelDeliveryModal({
  delivery,
  loading,
  onConfirm,
  onClose,
}: ConfirmCancelDeliveryModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, loading])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-cancel-delivery-title"
      onClick={() => !loading && onClose()}
    >
      <div
        className="flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 bg-red-50/60 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 id="confirm-cancel-delivery-title" className="text-base font-bold text-slate-900">
                Anular entrega
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Esta acción se reflejará en SISPRO y no se puede deshacer.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus:ring-[3px] focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="px-5 py-4 text-sm text-slate-700">
          <p className="mb-3">
            ¿Anular la entrega{' '}
            <span className="font-mono font-bold text-slate-900">{delivery.IDEntrega}</span>?
          </p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-md border border-slate-200 bg-slate-50 p-3 text-[12px]">
            <dt className="font-semibold text-slate-500">Producto</dt>
            <dd className="font-mono text-slate-800">{delivery.CodSerTecEntregado}</dd>
            <dt className="font-semibold text-slate-500">Cant. entregada</dt>
            <dd className="font-mono text-slate-800">{delivery.CantTotEntregada}</dd>
            <dt className="font-semibold text-slate-500">Fec. entrega</dt>
            <dd className="font-mono text-slate-800">{delivery.FecEntrega}</dd>
            <dt className="font-semibold text-slate-500">Lote</dt>
            <dd className="font-mono text-slate-800">{delivery.NoLote || '—'}</dd>
            <dt className="font-semibold text-slate-500">Recibió</dt>
            <dd className="font-mono text-slate-800">
              {delivery.TipoIDRecibe} {delivery.NoIDRecibe}
            </dd>
          </dl>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-[3px] focus:ring-red-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Anulando...
              </>
            ) : (
              'Sí, anular'
            )}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
