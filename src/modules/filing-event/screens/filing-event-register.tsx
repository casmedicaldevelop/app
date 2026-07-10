import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Upload, FileText, AlertCircle, CheckCircle2, Check, Stethoscope } from 'lucide-react'
import { useFilingEventOcr } from '../hooks/useFilingEventOcr'
import AuthorizationDetails, { type OcrData } from '../components/authorization-details'
import UserStepForm from '../components/user-step-form'
import ServicePickerModal, { type PickedService } from '../components/service-picker-modal'
import DoctorDrawer from '../../doctors/components/doctor-drawer'
import type { Doctor } from '../../doctors/types/doctor.types'
import type { HealthcareRegime } from '../../users/types/service-user.types'
import { useActiveEventContract } from '@/modules/evento/hooks/useEventContract'
import {
  filingEventService,
  type CreateFilingEventPayload,
} from '../services/filing-event.service'

const isPdf = (f: File) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
const onlyDigits = (s?: string | null) => (s ?? '').replace(/\D/g, '')
const cop = (n: number) => '$ ' + new Intl.NumberFormat('es-CO').format(n)

type Step = 'upload' | 'review' | 'user' | 'service' | 'summary'

const STEPS = [
  { key: 'review', label: 'Confirmar información' },
  { key: 'user', label: 'Datos del usuario' },
  { key: 'service', label: 'Servicios' },
  { key: 'summary', label: 'Resumen' },
] as const

export default function FilingEventRegisterPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [step, setStep] = useState<Step>('upload')

  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [doctorDrawerOpen, setDoctorDrawerOpen] = useState(false)

  // Selección por cada servicio del documento (índice → líneas elegidas con cantidad + prescripción).
  const [selections, setSelections] = useState<Record<number, PickedService[]>>({})
  const [pickerIdx, setPickerIdx] = useState<number | null>(null)
  const [userRegime, setUserRegime] = useState<HealthcareRegime | null>(null)
  const { data: activeContract } = useActiveEventContract()

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  // Si el número de autorización ya existe en radicación, guarda el id de esa radicación.
  const [duplicateId, setDuplicateId] = useState<number | null>(null)
  const ocr = useFilingEventOcr()

  const ocrData = ocr.data ? (ocr.data.data as OcrData) : null
  const servicios = ocrData?.servicios ?? []

  const errMsg = (ocr.error as { message?: string } | null)?.message ?? 'No se pudo procesar el documento'
  const currentStepIndex =
    step === 'summary' ? 3 : step === 'service' ? 2 : step === 'user' ? 1 : 0

  // El "Siguiente" se habilita solo con doctor elegido y TODOS los servicios resueltos.
  const allServicesSelected =
    servicios.length > 0 && servicios.every((_, i) => (selections[i]?.length ?? 0) > 0)
  const canProceed = !!doctor && allServicesSelected

  // Resumen / presupuesto: total del radicado y cupo del contrato para el régimen del usuario.
  const grandTotal = servicios.reduce(
    (sum, _s, i) => sum + (selections[i] ?? []).reduce((a, p) => a + p.quantity * p.row.value, 0),
    0,
  )
  const budget =
    userRegime === 'CONTRIBUTIVO' ? activeContract?.contributoryValue ?? 0
    : userRegime === 'SUBSIDIADO' ? activeContract?.subsidizedValue ?? 0
    : 0
  const consumed =
    userRegime === 'CONTRIBUTIVO' ? activeContract?.consumedContributory ?? 0
    : userRegime === 'SUBSIDIADO' ? activeContract?.consumedSubsidized ?? 0
    : 0
  const available = budget - consumed
  const projection = available - grandTotal
  const overBudget = projection < 0

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped && isPdf(dropped)) setFile(dropped)
  }

  const analyze = () => {
    if (!file) return
    setDuplicateId(null)
    ocr.mutate(file, {
      onSuccess: (res) => {
        setStep('review')
        const code = ((res?.data as OcrData | undefined)?.numero_autorizacion ?? '').trim()
        if (code) {
          filingEventService
            .findByAuthorization(code)
            .then((r) => setDuplicateId(r?.id ?? null))
            .catch(() => setDuplicateId(null))
        }
      },
    })
  }

  const cancel = () => {
    ocr.reset()
    setStep('upload')
    setDoctor(null)
    setSelections({})
    setPickerIdx(null)
    setUserRegime(null)
    setDuplicateId(null)
  }

  const confirmSelection = (idx: number, picked: PickedService[]) => {
    setSelections((prev) => ({ ...prev, [idx]: picked }))
    setPickerIdx(null)
  }

  // Paso final: arma la cabecera + las líneas (cada medicamento/insumo elegido con su cantidad y prescripción) y guarda.
  const save = async () => {
    if (!ocrData || !doctor || !canProceed) return
    const afi = ocrData.afiliado ?? {}
    const items = servicios.flatMap((_, i) =>
      (selections[i] ?? []).map((p) => ({
        cum: p.row.cum,
        name: p.row.name,
        serviceType: p.serviceType,
        quantity: p.quantity,
        unitValue: p.row.value,
        concentration: p.row.concentration,
        presentation: p.row.presentation,
        administrationRoute: p.row.administrationRoute,
        shortName: p.row.shortName,
        measurementUnit: p.row.measurementUnit,
        pharmaceuticalForm: p.row.pharmaceuticalForm,
        dispensingUnit: p.row.dispensingUnit,
        frequencyPerDay: p.frequencyPerDay,
        treatmentDuration: p.treatmentDuration,
        prescribedQuantity: p.prescribedQuantity,
        treatmentDays: p.treatmentDays,
      })),
    )
    const payload: CreateFilingEventPayload = {
      authorizationCode: ocrData.numero_autorizacion ?? '',
      senderCode: ocrData.codigo_remitente ?? '',
      senderName: ocrData.nombre_remitente ?? '',
      doctorDocument: doctor.id,
      userDocument: onlyDigits(afi.numero_documento),
      prescriptionDate: ocrData.fecha_orden_medica ?? '',
      authorizationDate: ocrData.fecha_autorizacion ?? '',
      requestDate: ocrData.fecha_solicitud_ips ?? '',
      mainDiagnosis: ocrData.diagnostico_principal ?? '',
      items,
    }
    setSaving(true)
    setSaveError(null)
    try {
      const created = await filingEventService.create(payload)
      // Refresca la lista de radicaciones y el contrato (cupos/consumido) al volver.
      void qc.invalidateQueries({ queryKey: ['filing-event-list'] })
      void qc.invalidateQueries({ queryKey: ['event-contract'] })
      navigate(`/dashboard/filing-event/${created.id}`)
    } catch (err) {
      setSaveError((err as { message?: string })?.message ?? 'No se pudo guardar la radicación.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-background px-6 py-4">
        <button type="button" onClick={() => navigate('/dashboard/filing-event')} aria-label="Volver" title="Volver"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-input text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-base font-semibold text-foreground">Nuevo registro</h1>
      </header>

      <div className="flex-1">
        {step === 'upload' ? (
          /* ---------- Subir documento ---------- */
          <section className="w-full bg-background">
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <FileText className="h-[18px] w-[18px]" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Documento de autorización</h2>
            </div>

            <div className="p-6">
              <div
                role="button"
                tabIndex={0}
                aria-label="Seleccionar o arrastrar PDF de autorización"
                onClick={() => fileRef.current?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click() } }}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center outline-none transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  dragging
                    ? 'border-primary bg-primary/5'
                    : file
                      ? 'border-emerald-400 bg-emerald-50/60'
                      : 'border-input bg-muted/40 hover:border-primary/50 hover:bg-muted/70'
                }`}
              >
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-background text-foreground/70 shadow-sm'}`}>
                  {file ? <CheckCircle2 className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
                </div>
                {file ? (
                  <>
                    <p className="text-sm font-semibold text-foreground break-all">{file.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB · haz clic para cambiar</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-foreground">Seleccionar PDF de autorización</p>
                    <p className="mt-1 text-xs text-muted-foreground">Arrastra el archivo o haz clic aquí · Solo .pdf</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)} />

              <div className="mt-5 flex justify-end">
                <button type="button" disabled={!file || ocr.isPending} onClick={analyze}
                  className="h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground cursor-pointer shadow-sm transition-all duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none">
                  {ocr.isPending ? 'Analizando documento…' : 'Analizar documento'}
                </button>
              </div>

              {ocr.isError && (
                <div role="alert" className="mt-4 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/8 px-4 py-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <p className="text-sm text-destructive">{errMsg}</p>
                </div>
              )}
            </div>
          </section>
        ) : (
          /* ---------- Wizard ---------- */
          <section className="w-full bg-background">
            {/* Stepper: número arriba, descripción debajo. Oculto si la autorización ya existe. */}
            {duplicateId === null && (
              <div className="border-b border-border px-6 py-4">
                <ol className="flex">
                  {STEPS.map((s, i) => {
                    const done = i < currentStepIndex
                    const active = i === currentStepIndex
                    return (
                      <li key={s.key} className="relative flex flex-1 flex-col items-center">
                        {i < STEPS.length - 1 && (
                          <span className="absolute left-1/2 top-3.5 h-px w-full bg-border" />
                        )}
                        <span className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                          done ? 'bg-emerald-500 text-white' : active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          {done ? <Check className="h-4 w-4" /> : i + 1}
                        </span>
                        <span className={`mt-2 px-1 text-center text-xs ${active || done ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
                      </li>
                    )
                  })}
                </ol>
              </div>
            )}

            {/* Autorización ya registrada: no se muestran los pasos, solo el aviso y el enlace al detalle. */}
            {duplicateId !== null && ocrData && (
              <div className="p-6">
                <div className="flex flex-col items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-6 py-16 text-center">
                  <AlertCircle className="h-9 w-9 text-amber-600" />
                  <p className="mt-3 text-sm font-semibold text-amber-900">
                    El número de autorización {ocrData.numero_autorizacion} ya está registrado
                  </p>
                  <p className="mt-1 text-sm text-amber-800">No se puede registrar de nuevo.</p>
                  <div className="mt-5 flex gap-3">
                    <button type="button" onClick={cancel}
                      className="h-10 rounded-xl border border-amber-300 bg-white px-5 text-sm font-medium text-amber-800 cursor-pointer transition-colors hover:bg-amber-100">
                      Volver
                    </button>
                    <button type="button" onClick={() => navigate(`/dashboard/filing-event/${duplicateId}`)}
                      className="h-10 rounded-xl bg-amber-600 px-5 text-sm font-semibold text-white cursor-pointer transition-colors hover:bg-amber-700">
                      Ver radicación
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 'review' && ocrData && duplicateId === null && (
              <div className="p-6">
                <AuthorizationDetails data={ocrData} />
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={cancel}
                    className="h-11 rounded-xl border border-input px-6 text-sm font-medium text-foreground cursor-pointer transition-colors hover:bg-muted">
                    Cancelar
                  </button>
                  <button type="button" onClick={() => setStep('user')}
                    className="h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground cursor-pointer shadow-sm transition-all duration-200 hover:bg-primary/90">
                    Confirmar
                  </button>
                </div>
              </div>
            )}

            {step === 'user' && ocrData && (
              <UserStepForm
                ocr={ocrData}
                onBack={() => setStep('review')}
                onSaved={(regime) => { setUserRegime(regime); setStep('service') }}
              />
            )}

            {step === 'service' && ocrData && (
              <div className="space-y-6 p-6">
                {/* Médico: ícono que abre el modal de selección */}
                <button type="button" onClick={() => setDoctorDrawerOpen(true)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-input bg-background px-4 py-3.5 text-left cursor-pointer transition-colors hover:border-primary/40 hover:bg-muted/40">
                  <span className="flex items-center gap-3">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground">
                      {doctor ? `${doctor.name} — ${doctor.id}` : 'Seleccionar o registrar médico…'}
                    </span>
                  </span>
                  <span className="text-xs font-medium text-primary">{doctor ? 'Cambiar' : 'Seleccionar'}</span>
                </button>

                {/* Servicios del documento: cada uno abre su modal de selección */}
                <div className="space-y-2">
                  {servicios.map((s, i) => {
                    const sel = selections[i]
                    const done = (sel?.length ?? 0) > 0
                    return (
                      <button key={i} type="button" onClick={() => setPickerIdx(i)}
                        className="flex w-full items-start justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3 text-left cursor-pointer transition-colors hover:border-primary/40 hover:bg-muted/40">
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-foreground">
                            <span className="font-mono">{s.codigo || '—'}</span>{s.descripcion ? ` · ${s.descripcion}` : ''}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {done ? `Seleccionado: ${sel!.map((p) => p.row.name).join(', ')}` : 'Sin seleccionar — clic para elegir'}
                          </span>
                        </span>
                        <span className={`mt-0.5 shrink-0 text-xs font-medium ${done ? 'text-emerald-600' : 'text-primary'}`}>
                          {done ? 'Editar' : 'Seleccionar'}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setStep('user')}
                    className="flex h-11 items-center gap-2 rounded-xl border border-input px-6 text-sm font-medium text-foreground cursor-pointer transition-colors hover:bg-muted">
                    <ArrowLeft className="h-4 w-4" /> Atrás
                  </button>
                  <button type="button" disabled={!canProceed} onClick={() => setStep('summary')}
                    className="flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground cursor-pointer shadow-sm transition-all duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none">
                    Siguiente <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <DoctorDrawer open={doctorDrawerOpen} onClose={() => setDoctorDrawerOpen(false)} selected={doctor} onSelect={setDoctor} />
                {pickerIdx !== null && servicios[pickerIdx] && (
                  <ServicePickerModal
                    cum={(servicios[pickerIdx].codigo ?? '').trim()}
                    description={servicios[pickerIdx].descripcion}
                    defaultQuantity={Number(servicios[pickerIdx].cantidad ?? 0)}
                    initial={selections[pickerIdx] ?? []}
                    onClose={() => setPickerIdx(null)}
                    onConfirm={(picked) => confirmSelection(pickerIdx, picked)}
                  />
                )}
              </div>
            )}

            {step === 'summary' && (
              <div className="space-y-6 p-6">
                {/* Servicios: valor unitario × cantidad a entregar = valor total por línea */}
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full min-w-[640px]">
                    <thead className="border-b border-border bg-muted/30">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Medicamento / insumo</th>
                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Cant. a entregar</th>
                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">V. unitario</th>
                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">V. total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {servicios.flatMap((_, i) => selections[i] ?? []).map((p, k) => (
                        <tr key={k}>
                          <td className="px-4 py-2.5 text-sm text-foreground">{p.row.name}</td>
                          <td className="px-4 py-2.5 text-right text-sm tabular-nums text-foreground">{p.quantity}</td>
                          <td className="px-4 py-2.5 text-right text-sm font-mono tabular-nums text-foreground">{cop(p.row.value)}</td>
                          <td className="px-4 py-2.5 text-right text-sm font-mono tabular-nums font-semibold text-foreground">{cop(p.quantity * p.row.value)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-border bg-muted/20">
                      <tr>
                        <td className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground" colSpan={3}>Valor total de la radicación</td>
                        <td className="px-4 py-2.5 text-right text-sm font-mono tabular-nums font-bold text-foreground">{cop(grandTotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Presupuesto del contrato según el régimen del usuario */}
                <div className="rounded-xl border border-border p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Presupuesto del contrato · régimen {userRegime ?? '—'}
                  </p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Cupo del régimen</p>
                      <p className="text-sm font-mono font-medium text-foreground">{cop(budget)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Consumido</p>
                      <p className="text-sm font-mono font-medium text-foreground">{cop(consumed)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Disponible</p>
                      <p className="text-sm font-mono font-medium text-foreground">{cop(available)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Proyección si se acepta</p>
                      <p className={`text-sm font-mono font-semibold ${overBudget ? 'text-rose-600' : 'text-emerald-700'}`}>{cop(projection)}</p>
                    </div>
                  </div>
                  {overBudget && (
                    <div role="alert" className="mt-3 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                      <p className="text-sm text-rose-700">
                        El valor de la radicación ({cop(grandTotal)}) supera el cupo disponible ({cop(available)}). No se puede crear.
                      </p>
                    </div>
                  )}
                </div>

                {saveError && (
                  <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/8 px-4 py-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <p className="text-sm text-destructive">{saveError}</p>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setStep('service')} disabled={saving}
                    className="flex h-11 items-center gap-2 rounded-xl border border-input px-6 text-sm font-medium text-foreground cursor-pointer transition-colors hover:bg-muted disabled:opacity-50">
                    <ArrowLeft className="h-4 w-4" /> Atrás
                  </button>
                  <button type="button" disabled={overBudget || saving} onClick={() => void save()}
                    className="flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground cursor-pointer shadow-sm transition-all duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none">
                    {saving ? 'Creando…' : 'Crear radicación'}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
