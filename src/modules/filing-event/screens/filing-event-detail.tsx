import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Activity,
  ArrowLeft,
  Barcode,
  Box,
  Boxes,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  ChevronDown,
  Timer,
  ClipboardList,
  CircleDot,
  FlaskConical,
  Hash,
  Layers,
  Package,
  Route,
  Ruler,
  Stethoscope,
  Tablets,
  Tag,
  Truck,
  User,
  Wallet,
  FolderOpen,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useFilingEvent } from '../hooks/useFilingEvent'
import { useFilingDeliveries } from '../hooks/use-filing-deliveries'
import { useUpdatePrescription } from '../hooks/use-update-prescription'
import { filingEventService } from '../services/filing-event.service'
import type { FilingEventDetail, FilingEventItem } from '../services/filing-event.service'
import { DeliveryModal } from '../components/delivery-modal'
import { DeliveriesByBatch } from '../components/deliveries-by-batch'
import { FilesManager } from '../../filing-mipres/components/files-manager'

const LIST_PATH = '/dashboard/filing-event'

const cop = (n: number) => `$ ${n.toLocaleString('es-CO')}`

const fmtDate = (iso: string | null) => {
  if (!iso) return '—'
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${y}/${m}/${d}`
}

const val = (v: string | number | null | undefined) =>
  v === null || v === undefined || v === '' ? '—' : String(v)

const LABEL = 'text-[11px] uppercase tracking-wider text-muted-foreground'
const VALUE = 'mt-1 text-xs font-medium text-foreground'

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  const empty = value === '—' || value === null || value === undefined
  return (
    <div>
      <div className={LABEL}>{label}</div>
      <div
        className={`${VALUE} ${mono ? 'font-mono' : ''} ${empty ? 'text-muted-foreground/50' : ''} break-words`}
      >
        {value ?? '—'}
      </div>
    </div>
  )
}

function Block({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="border-b border-border bg-background">
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5 sm:px-6">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="font-heading text-sm font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function IdCard({
  icon: Icon,
  label,
  value,
  title,
  mono = true,
  highlight = false,
}: {
  icon: LucideIcon
  label: string
  value: React.ReactNode
  title?: string
  mono?: boolean
  highlight?: boolean
}) {
  const empty = value === '—'
  const valueColor = highlight
    ? 'text-primary'
    : empty
      ? 'text-muted-foreground/50'
      : 'text-foreground'
  return (
    <div
      className={`min-w-0 rounded-lg border px-4 py-3 ${highlight ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/40'}`}
    >
      <div
        className={`mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${highlight ? 'text-primary/80' : 'text-muted-foreground'}`}
      >
        <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
        {label}
      </div>
      <div
        title={title}
        className={`block truncate text-xs font-medium ${mono ? 'font-mono' : ''} ${highlight ? 'font-semibold' : ''} ${valueColor}`}
      >
        {value}
      </div>
    </div>
  )
}

const STATUS_CARD: Record<string, { card: string; text: string; dot: string }> = {
  PENDIENTE: { card: 'border-amber-200 bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  ENTREGADO: {
    card: 'border-emerald-200 bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  ENTREGA_PARCIAL: { card: 'border-blue-200 bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
}

function StatusCard({ status, label }: { status: string; label: string | null }) {
  const s = STATUS_CARD[status] ?? {
    card: 'border-border bg-muted/40',
    text: 'text-muted-foreground',
    dot: 'bg-muted-foreground/60',
  }
  return (
    <div className={`min-w-0 rounded-lg border px-4 py-3 ${s.card}`}>
      <div
        className={`mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${s.text}`}
      >
        <span className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
        Estado
      </div>
      <div className={`text-xs font-semibold ${s.text}`}>{label ?? status}</div>
    </div>
  )
}

/** Card "Radicado" de la cabecera: registrar cuando ENTREGADO sin código; si hay, mostrarlo; si no aplica, "—". */
function RadicadoCard({ filing }: { filing: FilingEventDetail }) {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  if (filing.filingCode) {
    return <IdCard icon={Barcode} label="Radicado" value={filing.filingCode} />
  }

  const canRegister = filing.status === 'ENTREGADO'
  if (!canRegister) {
    return <IdCard icon={Barcode} label="Radicado" value="—" />
  }

  const save = async () => {
    const code = draft.trim()
    if (!code) {
      toast.error('Ingresá el código de radicado')
      return
    }
    setSaving(true)
    try {
      await filingEventService.setRadicado(filing.id, code)
      toast.success('Radicado registrado')
      setEditing(false)
      qc.invalidateQueries({ queryKey: ['filing-event', filing.id] })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo registrar el radicado')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-w-0 rounded-lg border border-primary/40 bg-primary/5 px-4 py-3">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary/80">
        <Barcode className="h-3.5 w-3.5 shrink-0 text-primary" />
        Radicado
      </div>
      {editing ? (
        <input
          type="text"
          value={draft}
          autoFocus
          disabled={saving}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void save()
            if (e.key === 'Escape') setEditing(false)
          }}
          placeholder="Código de radicado"
          className="h-8 w-full rounded-md border border-primary bg-background px-2 font-mono text-xs font-medium text-foreground focus:outline-none focus:ring-[3px] focus:ring-primary/20 disabled:opacity-60"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="cursor-pointer rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-primary/90"
        >
          Registrar radicado
        </button>
      )}
    </div>
  )
}

/** Tarjeta de prescripción editable con doble clic: el valor se vuelve un input numérico (entero >= 1). */
function EditablePrescriptionCard({
  icon: Icon,
  label,
  value,
  onSave,
}: {
  icon: LucideIcon
  label: string
  value: number
  onSave: (next: number) => Promise<boolean>
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))
  const [saving, setSaving] = useState(false)
  const closing = useRef(false)

  const begin = () => {
    setDraft(String(value))
    setEditing(true)
  }
  const finish = () => {
    closing.current = true
    setEditing(false)
  }
  const commit = async () => {
    // Ignora el blur que dispara el propio cierre (tras Enter/Escape) para no guardar dos veces.
    if (closing.current) {
      closing.current = false
      return
    }
    const raw = draft.trim()
    const next = Number(raw)
    if (raw === '' || !Number.isInteger(next) || next < 1) {
      toast.error('Ingresá un entero mayor o igual a 1')
      return
    }
    if (next === value) {
      finish()
      return
    }
    setSaving(true)
    const ok = await onSave(next)
    setSaving(false)
    if (ok) finish()
  }

  return (
    <div className="min-w-0 rounded-lg border border-border bg-muted/40 px-4 py-3">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
        {label}
      </div>
      {editing ? (
        <input
          type="number"
          min={1}
          inputMode="numeric"
          autoFocus
          disabled={saving}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void commit()
            if (e.key === 'Escape') finish()
          }}
          className="h-8 w-full rounded-md border border-primary bg-background px-2 font-mono text-xs font-medium text-foreground focus:outline-none focus:ring-[3px] focus:ring-primary/20 disabled:opacity-60"
        />
      ) : (
        <div
          onDoubleClick={begin}
          title="Doble clic para editar"
          className="block cursor-text truncate font-mono text-xs font-medium text-foreground"
        >
          {value}
        </div>
      )}
    </div>
  )
}

/** Desplegable de UNA línea (servicio): título + tarjetas de datos. Colapsable (dropdown). */
function ServiceSection({
  item,
  filingId,
}: {
  item: FilingEventItem
  filingId: number
}) {
  const [open, setOpen] = useState(false)
  const { mutateAsync } = useUpdatePrescription(item.id, filingId)
  const savePrescription =
    (field: 'frequencyPerDay' | 'treatmentDuration' | 'prescribedQuantity' | 'treatmentDays') =>
    async (next: number): Promise<boolean> => {
      try {
        await mutateAsync({ [field]: next })
        toast.success('Prescripción actualizada')
        return true
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'No se pudo actualizar')
        return false
      }
    }
  return (
    <section className="border-b border-border bg-background">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-2.5 bg-muted/40 px-4 py-3 text-left transition-colors hover:bg-muted/60 sm:px-6"
      >
        <Layers className="h-4 w-4 shrink-0 text-primary" />
        <h3 className="font-heading text-sm font-bold text-foreground break-words">{val(item.name)}</h3>
        <ChevronDown
          className={`ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Datos del servicio — cada dato en su tarjeta (colapsable) */}
      {open && (
        <div className="grid grid-cols-1 gap-3 border-b border-border px-4 py-4 sm:grid-cols-2 sm:px-6 xl:grid-cols-4">
            <IdCard icon={Package} label="CUM" value={val(item.cum)} />
            <IdCard icon={Tag} label="Tipo de servicio" value={val(item.serviceType)} mono={false} />
            <StatusCard status={item.status} label={item.statusLabel} />
            <IdCard icon={CircleDot} label="Subestado" value={val(item.substatusLabel)} mono={false} />
            <IdCard icon={CalendarCheck} label="F. entrega" value={fmtDate(item.deliveryDate)} />
            <IdCard icon={Timer} label="Oportunidad" value={item.opportunity ?? ''} />
            <IdCard icon={FlaskConical} label="Concentración" value={val(item.concentration)} mono={false} title={item.concentration} />
            <IdCard icon={Box} label="Presentación" value={val(item.presentation)} mono={false} title={item.presentation} />
            <IdCard icon={Route} label="Vía de administración" value={val(item.administrationRoute)} mono={false} title={item.administrationRoute} />
            <IdCard icon={Ruler} label="Unidad de medida" value={val(item.measurementUnitName)} mono={false} title={item.measurementUnitName} />
            <IdCard icon={Tablets} label="Forma farmacéutica" value={val(item.pharmaceuticalFormName)} mono={false} title={item.pharmaceuticalFormName} />
            <IdCard icon={Boxes} label="Unidad de dispensación" value={val(item.dispensingUnitName)} mono={false} title={item.dispensingUnitName} />
            <EditablePrescriptionCard icon={Timer} label="Frecuencia por día" value={item.frequencyPerDay} onSave={savePrescription('frequencyPerDay')} />
            <EditablePrescriptionCard icon={CalendarClock} label="Duración del tratamiento" value={item.treatmentDuration} onSave={savePrescription('treatmentDuration')} />
            <EditablePrescriptionCard icon={Hash} label="Cantidad prescrita" value={item.prescribedQuantity} onSave={savePrescription('prescribedQuantity')} />
            <EditablePrescriptionCard icon={CalendarDays} label="Días de tratamiento" value={item.treatmentDays} onSave={savePrescription('treatmentDays')} />
        </div>
      )}

    </section>
  )
}

/** Proceso de entrega único (parte inferior): botón que abre el modal + tabla de entregas por lote. */
function DeliverySection({ filing }: { filing: FilingEventDetail }) {
  const [open, setOpen] = useState(false)
  const hasPending = filing.items.some((it) => it.quantityPending > 0)
  const { data: deliveries, isLoading } = useFilingDeliveries(filing.id)
  return (
    <section className="border-y border-border bg-background">
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Truck className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-sm font-bold text-foreground">Entrega</h2>
        </div>
        {hasPending ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary/90"
          >
            <Truck className="h-4 w-4" />
            Registrar entrega
          </button>
        ) : (
          <span className="text-[13px] text-muted-foreground">Entrega completada</span>
        )}
      </div>

      {/* Tabla de entregas agrupada por lote */}
      {isLoading ? (
        <p className="border-t border-border px-4 py-5 text-[13px] text-muted-foreground sm:px-6">
          Cargando…
        </p>
      ) : !deliveries || deliveries.length === 0 ? (
        <p className="border-t border-border px-4 py-5 text-[13px] text-muted-foreground sm:px-6">
          Sin entregas registradas.
        </p>
      ) : (
        <DeliveriesByBatch filing={filing} deliveries={deliveries} />
      )}

      {open && <DeliveryModal filing={filing} onClose={() => setOpen(false)} />}
    </section>
  )
}

/** Resumen: tabla con todos los medicamentos/insumos de la radicación. */
function SummarySection({ items }: { items: FilingEventItem[] }) {
  const totalSum = items.reduce((sum, it) => sum + it.totalValue, 0)
  return (
    <section className="border-y border-border bg-background">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-muted/60">
              <th className={`px-5 py-2.5 font-semibold ${LABEL}`}>Medicamento</th>
              <th className={`px-4 py-2.5 text-right font-semibold ${LABEL}`}>Cant entregar</th>
              <th className={`px-4 py-2.5 text-right font-semibold ${LABEL}`}>Entrega</th>
              <th className={`px-4 py-2.5 text-right font-semibold ${LABEL}`}>Pendiente</th>
              <th className={`px-4 py-2.5 text-right font-semibold ${LABEL}`}>V. Unitario</th>
              <th className={`px-5 py-2.5 text-right font-semibold ${LABEL}`}>V. Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border">
                <td className="px-5 py-4 align-top">
                  <div className="text-sm font-medium text-foreground">{item.shortName}</div>
                </td>
                <td className="px-4 py-4 text-right align-top font-mono text-sm font-medium text-foreground">
                  {item.quantity}
                </td>
                <td className="px-4 py-4 text-right align-top font-mono text-sm font-medium text-foreground">
                  {item.quantityDelivered}
                </td>
                <td className="px-4 py-4 text-right align-top">
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 font-mono text-xs font-semibold text-amber-700">
                    {item.quantityPending}
                  </span>
                </td>
                <td className="px-4 py-4 text-right align-top font-mono text-sm font-medium text-foreground">
                  {cop(item.unitValue)}
                </td>
                <td className="px-5 py-4 text-right align-top font-mono text-sm font-semibold text-foreground">
                  {cop(item.totalValue)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-muted/30">
              <td className="px-5 py-4" colSpan={5} />
              <td className="px-5 py-4 text-right font-mono text-sm font-bold text-foreground">
                {cop(totalSum)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}

export default function FilingEventDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useFilingEvent(Number(id))
  const [filesOpen, setFilesOpen] = useState(false)

  return (
    <div className="flex min-h-full flex-col bg-background">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(LIST_PATH)}
            aria-label="Volver"
            title="Volver"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-input text-muted-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-[18px] w-[18px]" />
          </button>
          <h1 className="font-heading text-lg font-bold leading-tight text-foreground">
            Detalle de radicación
          </h1>
        </div>
        {data && (
          <button
            type="button"
            onClick={() => setFilesOpen((v) => !v)}
            title="Archivos del radicado"
            className="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#2d3436] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#3a4042]"
          >
            {filesOpen ? <X className="h-[18px] w-[18px]" /> : <FolderOpen className="h-[18px] w-[18px]" />}
            Archivos
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Cargando…
        </div>
      ) : isError || !data ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          No se pudo cargar la radicación.
        </div>
      ) : filesOpen ? (
        <div className="min-h-0 flex-1 overflow-hidden">
          <FilesManager entityId={Number(id)} service={filingEventService} queryNs="filing-event" />
        </div>
      ) : (
        <div className="flex-1">
          <DetailBody data={data} />
        </div>
      )}
    </div>
  )
}

function DetailBody({ data }: { data: FilingEventDetail }) {
  const u = data.user
  return (
    <div>
      {/* BLOQUE 1 — Estado y seguimiento (cabecera) */}
      <Block icon={Activity} title="Estado y seguimiento">
        <div className="space-y-5 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <IdCard icon={Hash} label="ID" value={data.id} />
            <IdCard
              icon={Tag}
              label="Autorización"
              value={val(data.authorizationCode)}
              title={data.authorizationCode}
            />
            <IdCard icon={CalendarPlus} label="F. ingreso" value={fmtDate(data.createdAt)} />
            <IdCard icon={CalendarClock} label="F. prescripción" value={fmtDate(data.prescriptionDate)} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <IdCard icon={CalendarCheck} label="F. autorización" value={fmtDate(data.authorizationDate)} />
            <IdCard icon={CalendarDays} label="F. solicitud" value={fmtDate(data.requestDate)} />
            <IdCard icon={User} label="Tipo de usuario" value={val(data.userType)} mono={false} />
            <StatusCard status={data.status} label={data.statusLabel} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <IdCard icon={Wallet} label="Valor total" value={cop(data.totalValue)} />
            <RadicadoCard filing={data} />
          </div>
        </div>
      </Block>

      {/* BLOQUE 2 — Usuario (cabecera) */}
      <Block icon={User} title="Usuario">
        <div className="px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Tipo de documento" value={val(u?.documentType)} />
            <Field label="Número de documento" value={val(data.userDocument)} mono />
            <Field label="Primer nombre" value={val(u?.firstName)} />
            <Field label="Segundo nombre" value={val(u?.secondName)} />
            <Field label="Primer apellido" value={val(u?.firstSurname)} />
            <Field label="Segundo apellido" value={val(u?.secondSurname)} />
            <Field label="Género" value={val(u?.gender)} />
            <Field label="Fecha de nacimiento" value={fmtDate(u?.birthDate ?? null)} mono />
            <Field label="Departamento" value={val(u?.department)} />
            <Field label="Municipio" value={val(u?.city)} />
            <Field label="Barrio" value={val(u?.neighborhood)} />
            <Field label="Dirección" value={val(u?.address)} />
            <Field label="Teléfono" value={val(u?.phone)} mono />
            <Field label="Correo" value={val(u?.email)} />
          </div>
        </div>
      </Block>

      {/* BLOQUE 3 — Diagnóstico (doctor + diagnóstico + remitente, global de la radicación) */}
      <Block icon={ClipboardList} title="Diagnóstico">
        <div className="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-2 sm:px-6 xl:grid-cols-4">
          <IdCard
            icon={Stethoscope}
            label="Documento doctor"
            value={val(data.doctor?.document ?? data.doctorDocument)}
          />
          <IdCard icon={User} label="Nombre doctor" value={val(data.doctor?.name)} mono={false} />
          <IdCard icon={Tag} label="Código diagnóstico" value={val(data.mainDiagnosis)} />
          <IdCard icon={Hash} label="Código remitente" value={val(data.senderCode)} />
          <div className="sm:col-span-2">
            <IdCard icon={ClipboardList} label="Detalle del diagnóstico" value={val(data.diagnosisDetail)} mono={false} />
          </div>
          <div className="sm:col-span-2">
            <IdCard icon={User} label="Nombre del remitente" value={val(data.senderName)} mono={false} />
          </div>
        </div>
      </Block>

      {/* Desplegables de cada medicamento/insumo, uno debajo del otro */}
      {data.items.map((item) => (
        <ServiceSection key={item.id} item={item} filingId={data.id} />
      ))}

      {/* Espacio de separación + Resumen */}
      <div className="h-8" />
      <SummarySection items={data.items} />

      {/* Proceso de entrega único (parte inferior) */}
      <DeliverySection filing={data} />

      <div className="h-16" />
    </div>
  )
}
