import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, AlertCircle, RefreshCw, CheckCircle2, Eye, Lock, LockOpen } from 'lucide-react'
import { useEventContracts, useSetContractOpen } from '../hooks/useEventContract'
import EventContractFormDrawer from '../components/event-contract-form-drawer'
import FinalizeContractModal from '../components/finalize-contract-modal'
import type { EventContract } from '../types/event-contract.types'

const EN_CURSO = 'EN CURSO'
const TH = 'px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap'
const TD = 'px-4 py-3 text-xs text-foreground whitespace-nowrap'

const cop = (n: number) => '$ ' + new Intl.NumberFormat('es-CO').format(n)
const fmtDate = (iso: string | null) => {
  if (!iso) return '—'
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

function StatusPill({ status }: { status: string }) {
  const isCurso = status === EN_CURSO
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
      isCurso ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
    }`}>
      {status}
    </span>
  )
}

export default function EventoListPage() {
  const navigate = useNavigate()
  const { data: contracts = [], isLoading, isError, refetch } = useEventContracts()
  const setOpen = useSetContractOpen()
  const [showForm, setShowForm] = useState(false)
  const [finalizeId, setFinalizeId] = useState<number | null>(null)

  const hasActive = contracts.some((c) => c.status === EN_CURSO)

  return (
    <>
      <div className="bg-background">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h1 className="text-base font-semibold text-foreground">Contratos</h1>
            <p className="text-xs text-muted-foreground">Gestione los contratos para eventos</p>
          </div>
          <button type="button" onClick={() => setShowForm(true)} disabled={hasActive}
            title={hasActive ? 'Ya hay un contrato en curso; finalízalo antes de crear uno nuevo' : undefined}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-primary text-xs font-semibold text-primary-foreground cursor-pointer hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100">
            <Plus className="h-3.5 w-3.5" />
            <span>Nuevo contrato</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Cargando…</div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <p className="text-sm text-muted-foreground">No se pudieron cargar los contratos</p>
            <button type="button" onClick={() => refetch()}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-input text-xs font-medium cursor-pointer hover:bg-muted">
              <RefreshCw className="h-3.5 w-3.5" /> Reintentar
            </button>
          </div>
        ) : contracts.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-16">
            <p className="text-sm font-medium text-foreground">Sin contratos</p>
            <p className="text-xs text-muted-foreground">Crea el primer contrato con el botón “Nuevo contrato”.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className={TH}>Número</th>
                  <th className={TH}>Inicio</th>
                  <th className={TH}>Final</th>
                  <th className={`${TH} text-right`}>Total</th>
                  <th className={`${TH} text-right`}>Contributivo</th>
                  <th className={`${TH} text-right`}>Subsidiado</th>
                  <th className={TH}>Estado</th>
                  <th className={TH}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contracts.map((c: EventContract) => (
                  <tr key={c.id} className="hover:bg-muted/20">
                    <td className={`${TD} font-mono`}>{c.contractNumber}</td>
                    <td className={TD}>{fmtDate(c.startDate)}</td>
                    <td className={TD}>{fmtDate(c.endDate)}</td>
                    <td className={`${TD} text-right tabular-nums`}>{cop(c.totalValue)}</td>
                    <td className={`${TD} text-right tabular-nums`}>{cop(c.contributoryValue)}</td>
                    <td className={`${TD} text-right tabular-nums`}>{cop(c.subsidizedValue)}</td>
                    <td className={TD}><StatusPill status={c.status} /></td>
                    <td className={`${TD} text-right`}>
                      <div className="flex items-center justify-end gap-1.5">
                        {c.status === EN_CURSO && (
                          <button type="button" disabled={setOpen.isPending}
                            onClick={() => setOpen.mutate({ id: c.id, isOpen: !c.isOpen })}
                            title={c.isOpen ? 'Cerrar contrato' : 'Abrir contrato'}
                            className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors disabled:opacity-50 ${
                              c.isOpen
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'border-input text-muted-foreground hover:bg-muted'
                            }`}>
                            {c.isOpen ? <LockOpen className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                            {c.isOpen ? 'Abierto' : 'Cerrado'}
                          </button>
                        )}
                        {c.status === EN_CURSO && (
                          <button type="button" onClick={() => setFinalizeId(c.id)}
                            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-input text-xs font-medium cursor-pointer hover:bg-muted transition-colors">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Finalizar
                          </button>
                        )}
                        <button type="button" onClick={() => navigate(`/dashboard/evento/${c.id}`)}
                          title="Ver detalle" aria-label="Ver detalle"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-input text-muted-foreground cursor-pointer hover:bg-muted transition-colors">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && <EventContractFormDrawer onClose={() => setShowForm(false)} />}
      {finalizeId !== null && <FinalizeContractModal id={finalizeId} onClose={() => setFinalizeId(null)} />}
    </>
  )
}
