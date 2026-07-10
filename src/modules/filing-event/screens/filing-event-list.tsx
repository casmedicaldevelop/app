import { useEffect, useRef, useState } from 'react'
import { CalendarPlus, CalendarCheck, Wallet, TrendingUp, Plus, Download, ScanLine, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useActiveEventContract } from '@/modules/evento/hooks/useEventContract'
import { filingEventService } from '../services/filing-event.service'
import FilingEventTable from '../components/filing-event-table'

const cop = (n: number) => '$ ' + new Intl.NumberFormat('es-CO').format(n)
const fmtDate = (iso: string | null) => {
  if (!iso) return '—'
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

const dias = (n: number) => `${n} ${n === 1 ? 'día' : 'días'}`

function parseLocal(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}
function todayLocal(): Date {
  const t = new Date()
  return new Date(t.getFullYear(), t.getMonth(), t.getDate())
}
function diffDays(target: Date, from: Date): number {
  return Math.round((target.getTime() - from.getTime()) / 86_400_000)
}

function startInfo(startIso: string): string {
  const d = diffDays(parseLocal(startIso), todayLocal())
  if (d > 0) return `Faltan ${dias(d)} para empezar`
  if (d === 0) return 'Empieza hoy'
  return `Empezó hace ${dias(-d)}`
}
function endInfo(endIso: string): string {
  const d = diffDays(parseLocal(endIso), todayLocal())
  if (d > 0) return `Faltan ${dias(d)} para terminar`
  if (d === 0) return 'Termina hoy'
  return `Terminó hace ${dias(-d)}`
}

// Color del consumo por umbral: 0-50% verde, 51-80% naranja, 81-100% rojo.
function consumoGradient(pct: number) {
  if (pct <= 50) return 'from-[#047857] to-[#10b981]'
  if (pct <= 80) return 'from-[#b45309] to-[#f59e0b]'
  return 'from-[#b91c1c] to-[#ef4444]'
}

function Blobs() {
  return (
    <>
      <span className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10" />
      <span className="pointer-events-none absolute -bottom-12 -left-8 h-20 w-20 rounded-full bg-white/5" />
    </>
  )
}

function CardHead({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid place-items-center rounded-lg bg-white/15 p-1.5">
        <Icon className="h-4 w-4 text-white" />
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">{label}</span>
    </div>
  )
}

function StatCard({ gradient, icon, label, value, footer, ghost: Ghost }: {
  gradient: string; icon: LucideIcon; label: string; value: string; footer?: string; ghost?: LucideIcon
}) {
  return (
    <article className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-4 shadow-lg shadow-black/5 transition-shadow hover:shadow-xl ${gradient}`}>
      <Blobs />
      {Ghost && <Ghost className="pointer-events-none absolute -bottom-5 -right-4 h-24 w-24 text-white opacity-10" />}
      <div className="relative z-10">
        <CardHead icon={icon} label={label} />
        <p className="mt-3 text-2xl font-extrabold tabular-nums text-white sm:text-3xl">{value}</p>
        {footer && <p className="mt-1.5 text-xs font-semibold tabular-nums text-white/85">{footer}</p>}
      </div>
    </article>
  )
}

function ConsumedCard({ label, amount, base, baseLabel }: {
  label: string; amount: number; base: number; baseLabel: string
}) {
  const pctExact = base > 0 ? (amount / base) * 100 : 0
  const pct = Math.round(pctExact)
  const width = Math.min(100, Math.max(0, pctExact))
  // Si hay consumo pero el porcentaje entero da 0, se muestran 2 decimales para que se vea.
  const pctLabel =
    pctExact === 0 ? '0' : pctExact >= 1 ? String(pct) : pctExact.toFixed(2).replace('.', ',')
  return (
    <article className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-4 shadow-lg shadow-black/5 transition-shadow hover:shadow-xl ${consumoGradient(pct)}`}>
      <Blobs />
      <div className="relative z-10">
        <CardHead icon={TrendingUp} label={label} />
        <p className="mt-3 text-2xl font-extrabold tabular-nums text-white sm:text-3xl">{cop(amount)}</p>
        <div className="mt-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${width}%` }} />
          </div>
          <p className="mt-1.5 text-xs font-semibold tabular-nums text-white/90">{pctLabel}% {baseLabel}</p>
        </div>
      </div>
    </article>
  )
}

export default function FilingEventListPage() {
  const navigate = useNavigate()
  const { data: contract, isLoading } = useActiveEventContract()
  const [exporting, setExporting] = useState(false)
  const [scanValue, setScanValue] = useState('')
  const [scanning, setScanning] = useState(false)
  const scanInputRef = useRef<HTMLInputElement>(null)

  // Al entrar al módulo, el foco se ubica en el lector de código de barras.
  useEffect(() => {
    scanInputRef.current?.focus()
  }, [])

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const blob = await filingEventService.exportExcel()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'registros-evento.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('No se pudo exportar el Excel')
    } finally {
      setExporting(false)
    }
  }

  // Lector de código de barras: el código es el código de autorización del radicado.
  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = scanValue.trim()
    if (!code || scanning) return
    setScanning(true)
    try {
      const found = await filingEventService.findByAuthorization(code)
      if (found) {
        setScanValue('')
        navigate(`/dashboard/filing-event/${found.id}`)
      } else {
        toast.error(`No existe un registro con el código ${code}`)
        setScanValue('')
        scanInputRef.current?.focus()
      }
    } catch {
      toast.error(`No existe un registro con el código ${code}`)
      setScanValue('')
      scanInputRef.current?.focus()
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-6 py-4">
        <h1 className="text-base font-semibold text-foreground">Radicación de evento</h1>
        {contract && (
          <div className="flex shrink-0 items-center gap-2">
            <form onSubmit={handleScan} className="shrink-0">
              <div className="relative">
                <ScanLine className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={scanInputRef}
                  type="text"
                  value={scanValue}
                  onChange={(e) => setScanValue(e.target.value)}
                  placeholder="Escanear código (autorización)"
                  disabled={scanning}
                  className="h-8 w-60 rounded-lg border border-input pl-8 pr-3 text-xs font-medium focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/20 disabled:opacity-50"
                />
              </div>
            </form>
            <button type="button" onClick={handleExport} disabled={exporting}
              className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-input px-3 text-xs font-medium transition-all duration-150 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">
              <Download className="h-3.5 w-3.5" />
              <span>{exporting ? 'Exportando…' : 'Exportar Excel'}</span>
            </button>
            <button type="button" onClick={() => navigate('/dashboard/filing-event/registro')}
              className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-primary text-xs font-semibold text-primary-foreground cursor-pointer hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-sm">
              <Plus className="h-3.5 w-3.5" />
              <span>Nueva radicación</span>
            </button>
          </div>
        )}
      </header>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Cargando…</div>
      ) : !contract ? (
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-sm text-muted-foreground">
            No hay un contrato en curso. Active un contrato para usar la radicación de evento.
          </p>
        </div>
      ) : (
        <div className="flex-1 space-y-4 py-6">
          <div className="space-y-4 px-6">
          {/* Fila 1: inicio · final · valor total · consumido total */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard gradient="from-[#1e293b] to-[#334155]" icon={CalendarPlus} label="Fecha de inicio" value={fmtDate(contract.startDate)} footer={startInfo(contract.startDate)} />
            <StatCard gradient="from-[#334155] to-[#475569]" icon={CalendarCheck} label="Fecha final" value={fmtDate(contract.endDate)} footer={endInfo(contract.endDate)} />
            <StatCard gradient="from-[#312e81] to-[#4f46b5]" icon={Wallet} ghost={Wallet} label="Valor total" value={cop(contract.totalValue - contract.consumedTotal)} footer={`Total ${cop(contract.totalValue)}`} />
            <ConsumedCard label="Consumido total" amount={contract.consumedTotal} base={contract.totalValue} baseLabel="del valor total" />
          </div>

          {/* Fila 2: contributivo (valor · consumido) · subsidiado (valor · consumido) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard gradient="from-[#1d4ed8] to-[#3b82f6]" icon={Wallet} ghost={Wallet} label="Valor contributivo" value={cop(contract.contributoryValue - contract.consumedContributory)} footer={`Total ${cop(contract.contributoryValue)}`} />
            <ConsumedCard label="Consumido contributivo" amount={contract.consumedContributory} base={contract.contributoryValue} baseLabel="del contributivo" />
            <StatCard gradient="from-[#0e7490] to-[#06b6d4]" icon={Wallet} ghost={Wallet} label="Valor subsidiado" value={cop(contract.subsidizedValue - contract.consumedSubsidized)} footer={`Total ${cop(contract.subsidizedValue)}`} />
            <ConsumedCard label="Consumido subsidiado" amount={contract.consumedSubsidized} base={contract.subsidizedValue} baseLabel="del subsidiado" />
          </div>
          </div>

          {/* Tabla de radicaciones del contrato en curso (100% ancho) */}
          <FilingEventTable />
        </div>
      )}
    </div>
  )
}
