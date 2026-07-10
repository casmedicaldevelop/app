import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { X, AlertCircle } from 'lucide-react'
import { useCreateEventContract } from '../hooks/useEventContract'

interface FormValues {
  contractNumber: string
  startDate: string
  endDate: string
  contributoryValue: number
  subsidizedValue: number
}

const LABEL = 'mb-1 block text-xs font-medium text-foreground'
const FIELD =
  'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50'
const FIELD_ERR =
  'h-10 w-full rounded-lg border border-destructive bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-destructive/20'

const cop = (n: number) => '$ ' + new Intl.NumberFormat('es-CO').format(Number.isFinite(n) ? n : 0)

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p role="alert" className="mt-1 flex items-center gap-1 text-xs text-destructive">
      <AlertCircle className="h-3 w-3" />
      {msg}
    </p>
  )
}

export default function EventContractFormDrawer({ onClose }: { onClose: () => void }) {
  const createMut = useCreateEventContract()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { contractNumber: '', startDate: '', endDate: '', contributoryValue: 0, subsidizedValue: 0 },
  })

  const fmtNum = (n: number) => new Intl.NumberFormat('es-CO').format(n)

  // Reglas registradas sin ref: el input es controlado y el valor en estado siempre es entero.
  register('contributoryValue', { required: 'Requerido', min: { value: 0, message: '≥ 0' } })
  register('subsidizedValue', { required: 'Requerido', min: { value: 0, message: '≥ 0' } })

  const contributory = Number(watch('contributoryValue')) || 0
  const subsidized = Number(watch('subsidizedValue')) || 0
  const total = contributory + subsidized

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

  const toInt = (v: unknown) => Number(String(v).replace(/\D/g, '')) || 0

  const onSubmit = handleSubmit((data) => {
    createMut.mutate(
      {
        contractNumber: data.contractNumber.trim(),
        startDate: data.startDate,
        endDate: data.endDate,
        contributoryValue: toInt(data.contributoryValue),
        subsidizedValue: toInt(data.subsidizedValue),
      },
      { onSuccess: onClose },
    )
  })

  const errMsg =
    (createMut.error as { message?: string } | null)?.message ?? 'No se pudo crear el contrato'

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 bg-[#2d3436]/40" onClick={onClose} aria-hidden="true" />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[460px] flex-col bg-background shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Nuevo contrato"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">Nuevo contrato</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} noValidate className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {createMut.isError && (
              <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/8 px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{errMsg}</p>
              </div>
            )}

            <div>
              <label htmlFor="ec-number" className={LABEL}>Número de contrato <span className="text-destructive">*</span></label>
              <input id="ec-number" type="text" autoComplete="off" disabled={createMut.isPending}
                {...register('contractNumber', {
                  required: 'Requerido',
                  setValueAs: (v: string) => v.trim(),
                  validate: (v: string) => v.trim().length > 0 || 'Requerido',
                })}
                className={errors.contractNumber ? FIELD_ERR : FIELD} />
              <FieldError msg={errors.contractNumber?.message} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ec-start" className={LABEL}>Fecha de inicio <span className="text-destructive">*</span></label>
                <input id="ec-start" type="date" disabled={createMut.isPending}
                  {...register('startDate', { required: 'Requerido' })}
                  className={errors.startDate ? FIELD_ERR : FIELD} />
                <FieldError msg={errors.startDate?.message} />
              </div>
              <div>
                <label htmlFor="ec-end" className={LABEL}>Fecha final <span className="text-destructive">*</span></label>
                <input id="ec-end" type="date" disabled={createMut.isPending}
                  {...register('endDate', { required: 'Requerido' })}
                  className={errors.endDate ? FIELD_ERR : FIELD} />
                <FieldError msg={errors.endDate?.message} />
              </div>
            </div>

            <div>
              <label htmlFor="ec-contrib" className={LABEL}>Valor contributivo (COP) <span className="text-destructive">*</span></label>
              <input id="ec-contrib" type="text" inputMode="numeric" disabled={createMut.isPending}
                value={contributory ? fmtNum(contributory) : ''}
                onChange={(e) =>
                  setValue('contributoryValue', Number(e.target.value.replace(/\D/g, '')) || 0, {
                    shouldValidate: true,
                  })
                }
                className={errors.contributoryValue ? FIELD_ERR : FIELD} />
              <FieldError msg={errors.contributoryValue?.message} />
            </div>

            <div>
              <label htmlFor="ec-subsid" className={LABEL}>Valor subsidiado (COP) <span className="text-destructive">*</span></label>
              <input id="ec-subsid" type="text" inputMode="numeric" disabled={createMut.isPending}
                value={subsidized ? fmtNum(subsidized) : ''}
                onChange={(e) =>
                  setValue('subsidizedValue', Number(e.target.value.replace(/\D/g, '')) || 0, {
                    shouldValidate: true,
                  })
                }
                className={errors.subsidizedValue ? FIELD_ERR : FIELD} />
              <FieldError msg={errors.subsidizedValue?.message} />
            </div>

            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="text-xs text-muted-foreground">Valor total (contributivo + subsidiado)</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">{cop(total)}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 border-t border-border bg-muted/20 px-5 py-4">
            <button type="button" onClick={onClose} disabled={createMut.isPending}
              className="h-10 flex-1 cursor-pointer rounded-lg border border-input text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={createMut.isPending}
              className="h-10 flex-1 cursor-pointer rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed">
              {createMut.isPending ? 'Creando...' : 'Crear contrato'}
            </button>
          </div>
        </form>
      </aside>
    </>,
    document.body,
  )
}
