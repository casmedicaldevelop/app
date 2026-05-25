import { createPortal } from 'react-dom'
import { X, AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  warning?: string
  confirmLabel?: string
  cancelLabel?: string
  isPending?: boolean
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  warning,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isPending = false,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative z-10 w-full max-w-sm rounded-2xl bg-background shadow-xl border border-border"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 id="confirm-dialog-title" className="text-base font-semibold text-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

          {warning && (
            <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">{warning}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="h-11 flex-1 rounded-lg border border-input text-sm font-medium
                         cursor-pointer hover:bg-muted active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className={[
                'h-11 flex-1 rounded-lg text-sm font-semibold',
                'cursor-pointer active:scale-[0.98]',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                'transition-all flex items-center justify-center gap-2',
                destructive
                  ? 'bg-destructive text-white hover:bg-destructive/90'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90',
              ].join(' ')}
            >
              {isPending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                  Procesando...
                </>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
