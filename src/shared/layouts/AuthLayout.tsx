import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col justify-between p-10 text-white"
        style={{ background: 'linear-gradient(160deg, #0F2363 0%, #1a3a8f 60%, #1e4fc4 100%)' }}
      >
        <div>
          <p className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            CASMEDICAL
          </p>
          <p className="mt-1 text-sm text-white/60">Distribución farmacéutica</p>
        </div>
        <div className="space-y-4">
          <blockquote className="text-lg font-medium leading-relaxed text-white/90">
            "Distribuyendo salud y bienestar en la Orinoquía colombiana."
          </blockquote>
          <p className="text-sm text-white/50">Casanare · Arauca · Meta · Boyacá · Vichada</p>
        </div>
        <p className="text-xs text-white/30">© 2026 CASMEDICAL. Todos los derechos reservados.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-10">
        <Outlet />
      </div>
    </div>
  )
}
