import {
  CircleCheck,
  CircleDashed,
  Clock,
  FileCheck2,
  Hourglass,
  Layers,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { FilingSummary } from '../types/filing-mipres.types'

function formatCOP(n: number): string {
  return `$ ${n.toLocaleString('es-CO')}`
}

interface MoneyCardProps {
  label: string
  amount: number
  count: number
  countLabel: string
  gradient: string
  icon: LucideIcon
}

function MoneyCard({ label, amount, count, countLabel, gradient, icon: Icon }: MoneyCardProps) {
  return (
    <article
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 shadow-lg shadow-black/5 transition-shadow hover:shadow-xl sm:p-6 ${gradient}`}
    >
      <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
      <span className="pointer-events-none absolute -bottom-12 -left-8 h-24 w-24 rounded-full bg-white/5" />
      <Icon className="pointer-events-none absolute -bottom-5 -right-4 h-28 w-28 text-white opacity-10 sm:h-36 sm:w-36" />
      <div className="relative z-10">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center rounded-lg bg-white/15 p-1.5">
            <Icon className="h-4 w-4 text-white" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
            {label}
          </span>
        </div>
        <p className="mt-4 font-heading text-3xl font-extrabold tabular-nums text-white sm:text-4xl">
          {formatCOP(amount)}
        </p>
        <p className="mt-1.5 text-sm font-semibold tabular-nums text-white/85">
          {count.toLocaleString('es-CO')} {countLabel}
        </p>
      </div>
    </article>
  )
}

interface CountCellProps {
  label: string
  value: number
  icon: LucideIcon
  chip: string
  accent: string
}

function CountCell({ label, value, icon: Icon, chip, accent }: CountCellProps) {
  return (
    <div className="group relative flex items-center gap-3.5 p-4 transition hover:bg-muted/50 sm:p-5">
      <span
        className={`absolute left-0 top-0 h-full w-1 opacity-0 transition group-hover:opacity-100 ${accent}`}
      />
      <span className={`grid place-items-center rounded-lg p-2.5 ${chip}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="leading-tight">
        <p className="font-heading text-2xl font-bold tabular-nums text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export default function FilingSummaryBar({ summary }: { summary: FilingSummary }) {
  return (
    <div className="space-y-5 border-b border-border p-5 sm:p-6">
      {/* 3 cards de dinero */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MoneyCard
          label="Total"
          amount={summary.totalAmount}
          count={summary.total}
          countLabel="registros"
          gradient="from-[#312e81] to-[#4f46b5]"
          icon={Wallet}
        />
        <MoneyCard
          label="Radicado"
          amount={summary.filingAmount}
          count={summary.filingCount}
          countLabel="radicados"
          gradient="from-[#047857] to-[#10b981]"
          icon={FileCheck2}
        />
        <MoneyCard
          label="Falta por radicar"
          amount={summary.faltaAmount}
          count={summary.faltaCount}
          countLabel="por radicar"
          gradient="from-[#b45309] to-[#f59e0b]"
          icon={Hourglass}
        />
      </div>

      {/* Franja de conteos: Total · Completos · Entrega parcial · Pendientes */}
      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <div className="grid grid-cols-2 divide-y divide-border lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          <CountCell
            label="Total"
            value={summary.total}
            icon={Layers}
            chip="bg-[#312e81]/10 text-[#312e81]"
            accent="bg-[#312e81]/70"
          />
          <CountCell
            label="Completos"
            value={summary.entregado}
            icon={CircleCheck}
            chip="bg-[#ecfdf5] text-[#047857]"
            accent="bg-[#047857]/70"
          />
          <CountCell
            label="Entrega parcial"
            value={summary.parcial}
            icon={CircleDashed}
            chip="bg-[#eff6ff] text-[#1d4ed8]"
            accent="bg-[#1d4ed8]/70"
          />
          <CountCell
            label="Pendientes"
            value={summary.pendiente}
            icon={Clock}
            chip="bg-[#fef3c7] text-[#92400e]"
            accent="bg-[#d97706]/70"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Los contadores reflejan los filtros aplicados.</p>
    </div>
  )
}
