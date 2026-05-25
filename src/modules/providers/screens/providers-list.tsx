import { useNavigate } from 'react-router-dom'
import { Building2, Phone, MapPin, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react'
import { useProviders } from '../hooks/useProviders'
import type { Provider } from '../types/providers.types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function ProviderCard({ provider }: { provider: Provider }) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(`/dashboard/providers/${provider.id}`)}
      className="w-full text-left rounded-lg border border-border bg-background p-4
        hover:border-primary/30 hover:bg-muted/20 transition-all duration-150
        cursor-pointer focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-ring focus-visible:ring-offset-1"
      aria-label={`Ver detalle de ${provider.name}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{provider.name}</p>
            <p className="text-xs text-muted-foreground font-mono">{provider.tableKey}</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 mt-0.5" />
      </div>

      {provider.description && (
        <p className="mt-2.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {provider.description}
        </p>
      )}

      <div className="mt-3 space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{provider.address ?? 'Sin dirección registrada'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="h-3 w-3 shrink-0" />
          <span>{provider.phone ?? 'Sin teléfono'}</span>
        </div>
      </div>

      <p className="mt-3 text-[10px] text-muted-foreground/60 tabular-nums">
        Actualizado: {formatDate(provider.updatedAt)}
      </p>
    </button>
  )
}

function ProviderCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-background p-4 animate-pulse">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-md bg-muted shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 w-20 rounded bg-muted" />
          <div className="h-3 w-28 rounded bg-muted" />
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-3/4 rounded bg-muted" />
      </div>
    </div>
  )
}

export default function ProvidersListPage() {
  const { data: providers, isLoading, isError, refetch } = useProviders()

  return (
    <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">

      {/* Panel header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h1 className="text-base font-semibold text-foreground">Proveedores</h1>
          {!isLoading && !isError && providers && (
            <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
              {providers.length} proveedor{providers.length !== 1 ? 'es' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <ProviderCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-destructive/60" />
          <div>
            <p className="text-sm font-medium text-foreground">Error al cargar proveedores</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Verifica tu conexión e inténtalo de nuevo</p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-input text-xs font-medium
                       cursor-pointer hover:bg-muted transition-all duration-150"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {providers!.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  )
}
