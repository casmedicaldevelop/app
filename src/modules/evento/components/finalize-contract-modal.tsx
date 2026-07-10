import { useState } from 'react'
import { useFinalizeEventContract } from '../hooks/useEventContract'

export default function FinalizeContractModal({ id, onClose }: { id: number; onClose: () => void }) {
  const [closeDate, setCloseDate] = useState('')
  const finalizeMut = useFinalizeEventContract()

  function confirm() {
    if (!closeDate) return
    finalizeMut.mutate({ id, payload: { closeDate } }, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !finalizeMut.isPending) onClose() }}>
      <div className="w-full max-w-xs rounded-xl border border-border bg-background shadow-xl">
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Finalizar contrato</h2>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Esta acción pasa el contrato a estado FINALIZADO y no se puede deshacer. Indica la fecha de cierre.
          </p>
          <label htmlFor="ec-close" className="mb-1 mt-4 block text-xs font-medium text-foreground">
            Fecha de cierre
          </label>
          <input id="ec-close" type="date" value={closeDate} disabled={finalizeMut.isPending}
            onChange={(e) => setCloseDate(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50" />
        </div>
        <div className="flex gap-2 px-5 pb-4">
          <button type="button" onClick={onClose} disabled={finalizeMut.isPending}
            className="flex-1 h-8 rounded-lg border border-input text-xs font-medium cursor-pointer hover:bg-muted disabled:opacity-50 transition-colors">
            Cancelar
          </button>
          <button type="button" onClick={confirm} disabled={!closeDate || finalizeMut.isPending}
            className="flex-1 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-semibold cursor-pointer hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {finalizeMut.isPending ? 'Finalizando...' : 'Finalizar'}
          </button>
        </div>
      </div>
    </div>
  )
}
