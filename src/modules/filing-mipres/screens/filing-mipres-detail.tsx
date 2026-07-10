import { Fragment, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { FilesManager } from '../components/files-manager'
import { filingMipresService } from '../services/filing-mipres.service'
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  Check,
  CircleDot,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileText,
  Fingerprint,
  FolderOpen,
  X,
  Hash,
  Link2,
  Package,
  Pill,
  Receipt,
  Stamp,
  Stethoscope,
  Tag,
  Truck,
  User,
  type LucideIcon,
} from 'lucide-react'
import { useFiling } from '../hooks/use-filing'
import { useUpdateRadicacion } from '../hooks/use-update-radicacion'
import { DeliveryPanel } from '../components/delivery-panel'
import type { FilingDetail } from '../types/filing-mipres.types'

const LIST_PATH = '/dashboard/filing-mipres'

function formatCOP(n: number): string {
  return `$ ${n.toLocaleString('es-CO')}`
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function capitalize(s: string | null | undefined): string {
  if (!s) return '—'
  return s.charAt(0) + s.slice(1).toLowerCase()
}

// Helpers de estilo del stepper (compartidos entre la variante desktop y mobile)
function stepCircle(done: boolean, current: boolean): string {
  if (done) return 'bg-emerald-600 text-white'
  if (current) return 'bg-amber-600 text-white ring-4 ring-amber-100'
  return 'border border-border bg-muted text-muted-foreground'
}
function stepStateLabel(done: boolean, current: boolean): string {
  if (done) return 'Completado'
  if (current) return 'Actual · pendiente'
  return 'Pendiente'
}
function stepStateColor(done: boolean, current: boolean): string {
  if (done) return 'text-emerald-700'
  if (current) return 'text-amber-700'
  return 'text-muted-foreground'
}
function stepTitleColor(done: boolean, current: boolean): string {
  return done || current ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'
}

const LABEL = 'text-[11px] uppercase tracking-wider text-muted-foreground'
const VALUE = 'mt-1 text-xs font-medium text-foreground'

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  const empty = value === '—' || value === null || value === undefined
  return (
    <div>
      <div className={LABEL}>{label}</div>
      <div className={`${VALUE} ${mono ? 'font-mono' : ''} ${empty ? 'text-muted-foreground/50' : ''}`}>
        {value ?? '—'}
      </div>
    </div>
  )
}

function Block({
  icon: Icon,
  title,
  right,
  children,
}: {
  icon: LucideIcon
  title: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="border-b border-border bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-sm font-bold text-foreground">{title}</h2>
        </div>
        {right}
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

function StatusCard({ status, label }: { status: string; label?: string | null }) {
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

export default function FilingMipresDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useFiling(Number(id))
  const [filesOpen, setFilesOpen] = useState(false)
  const canFiles = data?.status === 'ENTREGADO'

  const goBack = () => navigate(LIST_PATH)

  return (
    <div className="flex min-h-full flex-col bg-background md:h-full">
      {/* Header del detalle */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-border bg-background px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            title="Volver"
            aria-label="Volver"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-input text-muted-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-[18px] w-[18px]" />
          </button>
          <div>
            <h1 className="font-heading text-lg font-bold leading-tight text-foreground">
              Detalle de radicación
            </h1>
          </div>
        </div>
        <button
          type="button"
          disabled={!canFiles}
          onClick={() => setFilesOpen((v) => !v)}
          title={canFiles ? 'Archivos del radicado' : 'Disponible cuando la entrega esté completa'}
          className="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#2d3436] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#3a4042] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {filesOpen ? <X className="h-[18px] w-[18px]" /> : <FolderOpen className="h-[18px] w-[18px]" />}
          Archivos
        </button>
      </div>

      {/* Contenido: se muestra el gestor de archivos O el detalle, nunca encimados */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {filesOpen && data ? (
          <FilesManager entityId={Number(id)} service={filingMipresService} queryNs="filing" />
        ) : isLoading ? (
          <div className="h-full overflow-auto">
            <div className="space-y-4 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          </div>
        ) : isError || !data ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-20 text-center">
            <AlertCircle className="h-8 w-8 text-destructive/60" />
            <div>
              <p className="text-sm font-medium text-foreground">No se encontró el radicado</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                El registro no existe o no se pudo cargar
              </p>
            </div>
            <button
              type="button"
              onClick={goBack}
              className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-input px-3 text-xs font-medium transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al listado
            </button>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <DetailBody data={data} />
          </div>
        )}
      </div>
    </div>
  )
}

function RadicacionSheet({ filingId, onClose }: { filingId: number; onClose: () => void }) {
  const [invoiceDate, setInvoiceDate] = useState('')
  const [cufe, setCufe] = useState('')
  const [filingCode, setFilingCode] = useState('')
  const { mutateAsync, isPending } = useUpdateRadicacion(filingId)

  const canSave =
    !isPending && invoiceDate !== '' && cufe.trim() !== '' && filingCode.trim() !== ''

  const handleSave = async () => {
    if (!canSave) return
    try {
      await mutateAsync({ invoiceDate, cufe: cufe.trim(), filingCode: filingCode.trim() })
      toast.success('Radicación guardada')
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar la radicación')
    }
  }

  const inputClass =
    'h-10 rounded-md border border-border bg-background px-3 font-mono text-sm text-foreground focus:border-amber-500 focus:outline-none focus:ring-[3px] focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-60'

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-[#2d3436]/50"
      role="dialog"
      aria-modal="true"
      onClick={() => !isPending && onClose()}
    >
      <div
        className="w-full rounded-t-2xl border-t border-border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-2 border-b border-border px-5 py-4">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-600 text-white">
            <BadgeCheck className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">Registrar radicación</h3>
            <p className="text-[11px] text-muted-foreground">
              Completá los tres datos para cerrar la radicación.
            </p>
          </div>
        </header>
        <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              F. Factura <span className="text-rose-500">*</span>
            </span>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              disabled={isPending}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              CUFE <span className="text-rose-500">*</span>
            </span>
            <input
              type="text"
              value={cufe}
              onChange={(e) => setCufe(e.target.value)}
              placeholder="CUFE de la factura"
              disabled={isPending}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Radicado <span className="text-rose-500">*</span>
            </span>
            <input
              type="text"
              value={filingCode}
              onChange={(e) => setFilingCode(e.target.value)}
              placeholder="Código de radicado"
              disabled={isPending}
              className={inputClass}
            />
          </label>
        </div>
        <footer className="flex justify-end gap-2 border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-amber-600 px-4 text-sm font-bold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            {isPending ? 'Guardando…' : 'Guardar radicación'}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}

function DetailBody({ data }: { data: FilingDetail }) {
  const [radicarOpen, setRadicarOpen] = useState(false)
  // La radicación se puede registrar cuando entrega, reporte y facturación están
  // completos y aún no hay código de radicado.
  const canRadicar =
    data.deliveryId != null &&
    data.deliveryReportId != null &&
    data.billingId != null &&
    data.filingCode == null

  const stages: Array<{
    label: string
    icon: LucideIcon
    done: boolean
    onClick?: () => void
  }> = [
    { label: 'Amarre', icon: Link2, done: true },
    { label: 'Entrega', icon: Truck, done: data.deliveryId != null },
    { label: 'Reporte', icon: ClipboardCheck, done: data.deliveryReportId != null },
    { label: 'Facturación', icon: Receipt, done: data.billingId != null },
    {
      label: 'Radicación',
      icon: BadgeCheck,
      done: data.filingCode != null,
      onClick: canRadicar ? () => setRadicarOpen(true) : undefined,
    },
  ]
  const currentIdx = stages.findIndex((s) => !s.done)
  const p = data.patient

  return (
    <div>
      {radicarOpen && (
        <RadicacionSheet filingId={data.id} onClose={() => setRadicarOpen(false)} />
      )}
      {/* BLOQUE 1 — Estado y seguimiento */}
      <Block icon={Activity} title="Estado y seguimiento del proceso">
        <div className="space-y-5 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <IdCard icon={Hash} label="Registro" value={data.id} />
            <IdCard
              icon={ClipboardList}
              label="Prescripción"
              value={data.prescriptionNumber}
              title={data.prescriptionNumber}
            />
            <IdCard
              icon={CalendarPlus}
              label="F. Creación"
              value={formatDateTime(data.createdAt)}
            />
            <IdCard
              icon={Clock}
              label="F. Modificación"
              value={formatDateTime(data.updatedAt)}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatusCard status={data.status} label={data.statusLabel} />
            <IdCard
              icon={CircleDot}
              label="Subestado"
              value={data.substatusLabel ?? '—'}
              mono={false}
            />
            <IdCard
              icon={CalendarCheck}
              label="F. Entrega"
              value={formatDate(data.deliveryDate)}
            />
            <IdCard
              icon={CalendarClock}
              label="F. M. Entrega"
              value={formatDate(data.maxDeliveryDate)}
            />
          </div>

          {/* Stepper — horizontal en desktop */}
          <ol className="hidden w-full items-start sm:flex">
            {stages.map((st, i) => {
              const isCurrent = i === currentIdx
              const Icon = st.icon
              return (
                <Fragment key={st.label}>
                  <li className="flex shrink-0 flex-col items-center gap-2">
                    {st.onClick ? (
                      <button
                        type="button"
                        onClick={st.onClick}
                        title="Registrar radicación"
                        className={`grid h-9 w-9 cursor-pointer place-items-center rounded-full transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-amber-200 ${stepCircle(st.done, isCurrent)}`}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    ) : (
                      <span
                        className={`grid h-9 w-9 place-items-center rounded-full ${stepCircle(st.done, isCurrent)}`}
                      >
                        {st.done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </span>
                    )}
                    <div className="text-center">
                      <div className={`text-xs ${stepTitleColor(st.done, isCurrent)}`}>
                        {st.label}
                      </div>
                      <div
                        className={`text-[10px] uppercase tracking-wider ${stepStateColor(st.done, isCurrent)}`}
                      >
                        {stepStateLabel(st.done, isCurrent)}
                      </div>
                    </div>
                  </li>
                  {i < stages.length - 1 && (
                    <span
                      className={`mx-2 mt-[18px] h-0.5 flex-1 rounded-full ${st.done ? 'bg-emerald-600' : 'bg-border'}`}
                    />
                  )}
                </Fragment>
              )
            })}
          </ol>

          {/* Stepper — vertical en mobile */}
          <ol className="flex flex-col gap-3 sm:hidden">
            {stages.map((st, i) => {
              const isCurrent = i === currentIdx
              const Icon = st.icon
              return (
                <li key={st.label} className="flex items-center gap-3">
                  {st.onClick ? (
                    <button
                      type="button"
                      onClick={st.onClick}
                      title="Registrar radicación"
                      className={`grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-amber-200 ${stepCircle(st.done, isCurrent)}`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ) : (
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${stepCircle(st.done, isCurrent)}`}
                    >
                      {st.done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className={`text-sm ${stepTitleColor(st.done, isCurrent)}`}>
                      {st.label}
                    </div>
                    <div
                      className={`text-[10px] uppercase tracking-wider ${stepStateColor(st.done, isCurrent)}`}
                    >
                      {stepStateLabel(st.done, isCurrent)}
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>

          {/* IDs por etapa */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <IdCard icon={Link2} label="ID Programación" value={data.scheduleId} />
            <IdCard icon={Truck} label="ID Entrega" value={data.deliveryId ?? '—'} />
            <IdCard icon={ClipboardCheck} label="ID Reporte" value={data.deliveryReportId ?? '—'} />
            <IdCard icon={Receipt} label="ID Facturación" value={data.billingId ?? '—'} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <IdCard icon={FileText} label="N° Factura" value={data.invoiceCode ?? '—'} />
            <IdCard icon={Calendar} label="F. Factura" value={formatDate(data.invoiceDate)} />
            <IdCard
              icon={Fingerprint}
              label="CUFE"
              value={data.cufe ?? '—'}
              title={data.cufe ?? undefined}
            />
            <IdCard icon={Stamp} label="Radicado" value={data.filingCode ?? '—'} />
          </div>
        </div>
      </Block>

      {/* BLOQUE 2 — Usuario */}
      <Block icon={User} title="Usuario">
          <div className="px-4 py-5 sm:px-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
              <Field label="Tipo de documento" value={p?.documentType ?? '—'} />
              <Field label="Número de documento" value={p?.document ?? data.userDocument} mono />
              <Field label="Primer nombre" value={p?.firstName ?? '—'} />
              <Field label="Segundo nombre" value={p?.secondName ?? '—'} />
              <Field label="Primer apellido" value={p?.firstSurname ?? '—'} />
              <Field label="Segundo apellido" value={p?.secondSurname ?? '—'} />
              <Field label="Género" value={p ? capitalize(p.gender) : '—'} />
              <Field label="Fecha de nacimiento" value={formatDate(p?.birthDate ?? null)} mono />
              <Field label="Régimen" value={p ? capitalize(p.healthcareRegime) : '—'} />
              <Field label="Teléfono" value={p?.phone ?? '—'} mono />
              <Field label="Email" value={p?.email ?? '—'} />
              <Field label="Ciudad" value={p?.city ?? '—'} />
              <Field label="Barrio" value={p?.neighborhood ?? '—'} />
              <Field label="Dirección" value={p?.address ?? '—'} />
            </div>
          </div>
        </Block>

      {/* BLOQUE 4 — Medicamento (con médico recetante) */}
      <Block icon={Pill} title="Medicamento">
        {/* Médico recetante + códigos del ítem — cards, no afecta la tabla */}
        <div className="grid grid-cols-1 gap-3 border-b border-border px-4 py-4 sm:grid-cols-2 sm:px-6 xl:grid-cols-4">
          <IdCard
            icon={Stethoscope}
            label="# Médico"
            value={data.doctor?.document ?? data.doctorDocument}
          />
          <IdCard icon={User} label="Nombre Médico" value={data.doctor?.name ?? '—'} mono={false} />
          <IdCard icon={Package} label="Cód. Inventario" value={data.inventoryCode ?? '—'} />
          <IdCard icon={Tag} label="Tecnología" value={data.technologyCode} highlight />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th className={`px-5 py-2.5 font-semibold ${LABEL}`}>Medicamento</th>
                <th className={`px-4 py-2.5 text-right font-semibold ${LABEL}`}>Cant Entregar</th>
                <th className={`px-4 py-2.5 text-right font-semibold ${LABEL}`}>Entrega</th>
                <th className={`px-4 py-2.5 text-right font-semibold ${LABEL}`}>Pendiente</th>
                <th className={`px-4 py-2.5 text-right font-semibold ${LABEL}`}>V. Unitario</th>
                <th className={`px-5 py-2.5 text-right font-semibold ${LABEL}`}>V. Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-5 py-4 align-top">
                  <div className="text-sm font-medium text-foreground">{data.medicationName}</div>
                </td>
                <td className="px-4 py-4 text-right align-top font-mono text-sm font-medium text-foreground">
                  {data.quantityToDeliver}
                </td>
                <td className="px-4 py-4 text-right align-top font-mono text-sm font-medium text-foreground">
                  {data.quantityDelivered}
                </td>
                <td className="px-4 py-4 text-right align-top">
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 font-mono text-xs font-semibold text-amber-700">
                    {data.quantityPending}
                  </span>
                </td>
                <td className="px-4 py-4 text-right align-top font-mono text-sm font-medium text-foreground">
                  {formatCOP(data.unitPrice)}
                </td>
                <td className="px-5 py-4 text-right align-top font-mono text-sm font-semibold text-foreground">
                  {formatCOP(data.totalPrice)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Block>

      {/* Separación entre Medicamento y la sección de Entrega */}
      <div className="h-3 bg-muted/40" />

      {/* BLOQUE 5 — Entrega (encabezado + botón → modal + tabla de registros) */}
      <DeliveryPanel filing={data} />

      {/* Aire al final para que la tabla no quede pegada al borde inferior al hacer scroll */}
      <div className="h-16" />
    </div>
  )
}
