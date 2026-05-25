import { useState } from 'react'
import { AlertCircle, CircleAlert, FileSearch, Inbox } from 'lucide-react'

import { usePrescriptionSession } from '../hooks/use-prescription-session'
import { usePatient } from '../hooks/use-patient'
import { useRoutings } from '../modules/routings/hooks/use-routings'
import { useSchedules } from '../modules/schedules/hooks/use-schedules'
import { useDeliveries } from '../modules/deliveries/hooks/use-deliveries'
import { useDeliveryReports } from '../modules/delivery-reports/hooks/use-delivery-reports'
import { useFacturacion } from '../modules/facturacion/hooks/use-facturacion'

import PrescriptionGate from '../components/prescription-gate'
import PatientContextBar from '../components/patient-context-bar'
import ToolDock from '../components/tool-dock'
import RawJsonModal from '../components/raw-json-modal'
import EditPatientModal from '../components/edit-patient-modal'
import RegisterPatientForm from '../components/register-patient-form'

import RoutingsPanel from '../modules/routings/components/routings-panel'
import SchedulesPanel from '../modules/schedules/components/schedules-panel'
import DeliveriesPanel from '../modules/deliveries/components/deliveries-panel'
import NewDeliveryModal from '../modules/deliveries/components/new-delivery-modal'
import ConfirmCancelDeliveryModal from '../modules/deliveries/components/confirm-cancel-delivery-modal'
import DeliveryReportsPanel from '../modules/delivery-reports/components/delivery-reports-panel'
import ConfirmCancelDeliveryReportModal from '../modules/delivery-reports/components/confirm-cancel-delivery-report-modal'
import FacturacionPanel from '../modules/facturacion/components/facturacion-panel'
import ConfirmCancelFacturacionModal from '../modules/facturacion/components/confirm-cancel-facturacion-modal'

import type { EntregaItem } from '../modules/deliveries/types/deliveries.types'
import type { ReporteEntregaItem } from '../modules/delivery-reports/types/delivery-reports.types'
import type { FacturacionItem } from '../modules/facturacion/types/facturacion.types'

export default function MipresPage() {
  const session = usePrescriptionSession()
  const {
    prescriptionInput,
    setPrescriptionInput,
    workspace,
    setWorkspace,
    error,
    loading,
    loadPrescription,
    clearPrescription,
    activeTool,
    setActiveTool,
    companyConfigured,
    company,
  } = session

  const prescriptionNumber = workspace?.prescriptionNumber

  const patient = usePatient({ workspace, setWorkspace })
  const schedules = useSchedules({ prescriptionNumber })
  const routings = useRoutings({
    prescriptionNumber,
    company,
    onBindSuccess: () => setActiveTool('schedules'),
  })
  const deliveries = useDeliveries({ prescriptionNumber })
  const facturacion = useFacturacion({ prescriptionNumber })
  const deliveryReports = useDeliveryReports({
    prescriptionNumber,
    onFacturacionSuccess: () => {
      void facturacion.refetch()
      setActiveTool('facturacion')
    },
  })

  // Refresca la lista del submódulo correspondiente cada vez que el usuario
  // entra al tool, ya sea por click directo o por redirección post-amarre.
  // SISPRO no garantiza consistencia inmediata: un refetch fresco al entrar
  // protege contra estados intermedios.
  const handleToolChange = (tool: typeof activeTool) => {
    setActiveTool(tool)
    if (tool === 'schedules') {
      void schedules.refetch()
    }
    if (tool === 'entregas') {
      void deliveries.refetch()
    }
    if (tool === 'delivery-reports') {
      void deliveryReports.refetch()
    }
    if (tool === 'facturacion') {
      void facturacion.refetch()
    }
  }

  const hasWorkspace = !!workspace
  const dockEnabled = hasWorkspace && workspace.routings.length > 0
  const [showRawJson, setShowRawJson] = useState(false)
  const [showEditPatient, setShowEditPatient] = useState(false)
  const [showNewDelivery, setShowNewDelivery] = useState(false)
  const [deliveryToCancel, setDeliveryToCancel] = useState<EntregaItem | null>(null)
  const [reportToCancel, setReportToCancel] = useState<ReporteEntregaItem | null>(null)
  const [facturacionToCancel, setFacturacionToCancel] = useState<FacturacionItem | null>(null)
  const patientUser = workspace?.patient?.exists === true ? workspace.patient.user : null
  const patientTipoDoc = workspace?.routings[0]?.TipoIDPaciente ?? 'CC'

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <div className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
        <span className="hidden text-xs font-medium uppercase tracking-wider text-slate-400 sm:inline">
          {hasWorkspace
            ? 'Trabajando sobre prescripción cargada'
            : 'Buscá una prescripción para iniciar'}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {hasWorkspace && (
            <button
              type="button"
              onClick={() => setShowRawJson(true)}
              aria-label="Ver respuesta cruda de SISPRO"
              title="Ver respuesta cruda de SISPRO"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors duration-150 hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
            >
              <CircleAlert className="h-4 w-4" />
            </button>
          )}
          <PrescriptionGate
            value={prescriptionInput}
            onChange={setPrescriptionInput}
            onSubmit={() => loadPrescription(prescriptionInput)}
            loading={loading}
            loaded={workspace?.prescriptionNumber ?? null}
            onClear={clearPrescription}
          />
        </div>
      </div>

      <div className="sticky top-14 z-10">
        <PatientContextBar
          workspace={workspace}
          error={error}
          onEditPatient={patientUser ? () => setShowEditPatient(true) : undefined}
        />
      </div>

      <div className="flex flex-1 min-h-0 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
        <ToolDock
          enabled={dockEnabled}
          activeTool={activeTool}
          onToolChange={handleToolChange}
        />

        <main className="flex-1 bg-slate-100 p-6 md:overflow-y-auto">
          {!hasWorkspace && !error && <IdleState />}
          {error && <ErrorState message={error} />}
          {hasWorkspace && workspace.routings.length === 0 && <EmptyState />}
          {hasWorkspace && workspace.patient?.exists === false && (
            <RegisterPatientForm
              fromMipres={workspace.patient.fromMipres}
              onSubmit={patient.registerPatient}
              onCancel={clearPrescription}
              submitting={patient.registerSubmitting}
            />
          )}
          {hasWorkspace && workspace.patient?.exists === true && activeTool === 'routings' && (
            <RoutingsPanel
              items={workspace.routings}
              prescriptionNumber={workspace.prescriptionNumber}
              onBind={routings.bindRouting}
              bindingIds={routings.bindingIds}
              companyConfigured={companyConfigured}
            />
          )}
          {hasWorkspace && workspace.patient?.exists === true && activeTool === 'schedules' && (
            <SchedulesPanel
              items={schedules.schedules}
              loading={schedules.loading}
              error={schedules.error}
              onCancel={schedules.cancelSchedule}
              cancelingIds={schedules.cancelingIds}
              pendingBindCount={routings.bindingIds.size}
            />
          )}
          {hasWorkspace && workspace.patient?.exists === true && activeTool === 'entregas' && (
            <DeliveriesPanel
              items={deliveries.deliveries}
              loading={deliveries.loading}
              error={deliveries.error}
              onCreateClick={() => setShowNewDelivery(true)}
              onCancel={(d) => setDeliveryToCancel(d)}
              cancelingDeliveryIds={deliveries.cancelingIds}
              onReport={deliveries.reportDelivery}
              reportingDeliveryIds={deliveries.reportingIds}
            />
          )}
          {hasWorkspace && workspace.patient?.exists === true && activeTool === 'delivery-reports' && (
            <DeliveryReportsPanel
              items={deliveryReports.reports}
              loading={deliveryReports.loading}
              error={deliveryReports.error}
              onCancel={(r) => setReportToCancel(r)}
              cancelingIds={deliveryReports.cancelingIds}
              onFacturacion={deliveryReports.createFacturacion}
              facturando={deliveryReports.facturando}
              routings={workspace.routings}
            />
          )}
          {hasWorkspace && workspace.patient?.exists === true && activeTool === 'facturacion' && (
            <FacturacionPanel
              items={facturacion.facturaciones}
              loading={facturacion.loading}
              error={facturacion.error}
              onCancel={(f) => setFacturacionToCancel(f)}
              cancelingIds={facturacion.cancelingIds}
            />
          )}
        </main>
      </div>

      {showRawJson && hasWorkspace && (
        <RawJsonModal
          title={`Respuesta SISPRO · prescripción ${workspace.prescriptionNumber}`}
          data={workspace.routings}
          onClose={() => setShowRawJson(false)}
        />
      )}

      {showEditPatient && patientUser && (
        <EditPatientModal
          user={patientUser}
          tipoDoc={patientTipoDoc}
          submitting={patient.updateSubmitting}
          onSubmit={async (payload) => {
            await patient.updatePatient(payload)
            setShowEditPatient(false)
          }}
          onClose={() => setShowEditPatient(false)}
        />
      )}

      {showNewDelivery && hasWorkspace && (
        <NewDeliveryModal
          routings={workspace.routings}
          patient={workspace.patient}
          loading={deliveries.registering}
          onClose={() => setShowNewDelivery(false)}
          onSubmit={deliveries.registerDelivery}
        />
      )}

      {deliveryToCancel && (
        <ConfirmCancelDeliveryModal
          delivery={deliveryToCancel}
          loading={deliveries.cancelingIds.has(deliveryToCancel.IDEntrega)}
          onClose={() => setDeliveryToCancel(null)}
          onConfirm={async () => {
            const target = deliveryToCancel
            await deliveries.cancelDelivery(target)
            setDeliveryToCancel(null)
          }}
        />
      )}

      {reportToCancel && (
        <ConfirmCancelDeliveryReportModal
          report={reportToCancel}
          loading={deliveryReports.cancelingIds.has(reportToCancel.IDReporteEntrega)}
          onClose={() => setReportToCancel(null)}
          onConfirm={async () => {
            const target = reportToCancel
            await deliveryReports.cancelDeliveryReport(target)
            setReportToCancel(null)
          }}
        />
      )}

      {facturacionToCancel && (
        <ConfirmCancelFacturacionModal
          facturacion={facturacionToCancel}
          loading={facturacion.cancelingIds.has(facturacionToCancel.IDFacturacion)}
          onClose={() => setFacturacionToCancel(null)}
          onConfirm={async () => {
            const target = facturacionToCancel
            await facturacion.cancelFacturacion(target)
            setFacturacionToCancel(null)
          }}
        />
      )}
    </div>
  )
}

function IdleState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <FileSearch className="h-8 w-8" />
      </div>
      <h2 className="text-lg font-bold text-slate-900">Cargá una prescripción para comenzar</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Ingresá el número de prescripción en el campo superior derecho. Una vez cargada, todas las
        herramientas quedan disponibles sobre esa prescripción.
      </p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Inbox className="h-8 w-8" />
      </div>
      <h2 className="text-lg font-bold text-slate-900">Prescripción sin direccionamientos</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        SISPRO devolvió un array vacío. Verificá el número o consultá con el médico tratante.
      </p>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="text-lg font-bold text-slate-900">No se pudo cargar la prescripción</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
    </div>
  )
}
