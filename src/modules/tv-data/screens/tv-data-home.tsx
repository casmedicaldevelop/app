import { useNavigate } from 'react-router-dom'
import { Database, Table2, Grid3x3, type LucideIcon } from 'lucide-react'

/**
 * Hub del módulo TvData. Estructura como MiPres: main full-bleed; este componente arma sus bandas
 * de header (blancas, 100% ancho, borde abajo, texto con padding). Títulos = grupos MIPRES y
 * EVENTOS, cada uno con subtítulo. Las cards muestran solo el nombre de la tabla + ícono, a ~1/3.
 * tvmed_mipres navega a su gestión completa (lista/registrar/editar/carga Excel). Las otras dos
 * tablas aún no existen → cards inertes.
 */

interface CardDef {
  table: string
  icon: LucideIcon
  gradient: string
  onClick?: () => void
}

function GradientCard({ table, icon: Icon, gradient, onClick }: CardDef) {
  const base = `relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 shadow-lg shadow-black/5 ${gradient}`
  const body = (
    <>
      <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
      <span className="pointer-events-none absolute -bottom-12 -left-8 h-24 w-24 rounded-full bg-white/5" />
      <Icon className="pointer-events-none absolute -bottom-5 -right-4 h-28 w-28 text-white opacity-10" />
      <div className="relative z-10">
        <span className="grid w-fit place-items-center rounded-lg bg-white/15 p-2">
          <Icon className="h-5 w-5 text-white" />
        </span>
        <p className="mt-4 font-mono text-2xl font-extrabold text-white">{table}</p>
      </div>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} cursor-pointer text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-slate-50`}
      >
        {body}
      </button>
    )
  }
  return <article className={base}>{body}</article>
}

function GroupHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b border-border bg-white px-6 py-4">
      <h2 className="font-heading text-lg font-bold text-foreground">{title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  )
}

const CARD_GRID = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'

export default function TvDataHomePage() {
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <div className="flex-1 overflow-y-auto pb-6">
        <GroupHeader title="MIPRES" subtitle="Gestione los medicamentos para MIPRES" />
        <div className="px-6 py-5">
          <div className={CARD_GRID}>
            <GradientCard
              table="tvmed_mipres"
              icon={Database}
              gradient="from-[#312e81] to-[#4f46b5]"
              onClick={() => navigate('/dashboard/tv-data/tvmed_mipres')}
            />
          </div>
        </div>

        <GroupHeader title="EVENTOS" subtitle="Gestione los medicamentos e insumos para EVENTOS" />
        <div className="px-6 py-5">
          <div className={CARD_GRID}>
            <GradientCard
              table="tvmed_evento"
              icon={Table2}
              gradient="from-[#047857] to-[#10b981]"
              onClick={() => navigate('/dashboard/tv-data/tvmed_evento')}
            />
            <GradientCard
              table="tvins_evento"
              icon={Grid3x3}
              gradient="from-[#b45309] to-[#f59e0b]"
              onClick={() => navigate('/dashboard/tv-data/tvins_evento')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
