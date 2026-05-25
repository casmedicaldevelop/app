import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, CheckCircle2, SkipForward, AlertCircle, RefreshCw, Loader2 } from 'lucide-react'
import { useCumMatchingPending } from '../hooks/useCumMatchingPending'
import { useCumSuggestions } from '../hooks/useCumSuggestions'
import { useAssignCum } from '../hooks/useAssignCum'
import { useSkipCum } from '../hooks/useSkipCum'
import type { CumSuggestion } from '../types/products.types'

export default function CumMatchingProvider1Page() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading, isError, refetch } = useCumMatchingPending()
  const pending = data

  const currentProduct = pending?.next
  const autoQuery = currentProduct?.product ?? ''
  const activeQuery = searchQuery.trim().length > 2 ? searchQuery.trim() : autoQuery

  const { data: suggestions = [], isFetching: loadingSuggestions } = useCumSuggestions(activeQuery)

  const assignMutation = useAssignCum()
  const skipMutation = useSkipCum()

  const isBusy = assignMutation.isPending || skipMutation.isPending

  function handleAssign(suggestion: CumSuggestion) {
    if (!currentProduct || isBusy) return
    assignMutation.mutate(
      { code: currentProduct.code, cum: suggestion.cum },
      { onSuccess: () => setSearchQuery('') },
    )
  }

  function handleSkip() {
    if (!currentProduct || isBusy) return
    skipMutation.mutate(
      { code: currentProduct.code },
      { onSuccess: () => setSearchQuery('') },
    )
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/dashboard/products')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a Productos
        </button>
        {pending && pending.total > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700 tabular-nums">
            {pending.total} pendiente{pending.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h1 className="text-base font-semibold text-foreground">Asignación CUM — DIS</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Seleccione el CUM correspondiente a cada producto desde el catálogo del proveedor DIS
          </p>
        </div>

        <div className="px-6 py-6">

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">Cargando cola de asignación...</p>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
              <AlertCircle className="h-7 w-7 text-destructive/60" />
              <div>
                <p className="text-sm font-medium text-foreground">Error al cargar productos pendientes</p>
                <p className="text-xs text-muted-foreground mt-0.5">Verifica tu conexión e inténtalo de nuevo</p>
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-input text-xs font-medium cursor-pointer hover:bg-muted transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reintentar
              </button>
            </div>
          )}

          {/* All done */}
          {!isLoading && !isError && pending?.total === 0 && (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">¡Asignación completada!</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Todos los productos tienen CUM asignado o están marcados como no aplica
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/dashboard/products')}
                className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold cursor-pointer hover:bg-primary/90 transition-all"
              >
                Volver a Productos
              </button>
            </div>
          )}

          {/* Active item */}
          {!isLoading && !isError && currentProduct && (
            <div className="space-y-5">

              {/* Current product card */}
              <div className="rounded-lg border border-border bg-muted/20 px-5 py-4 space-y-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Producto a asignar
                    </p>
                    <p className="text-sm font-semibold text-foreground leading-snug break-words">
                      {currentProduct.product}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">{currentProduct.code}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">Afecta</p>
                    <p className="text-lg font-bold text-foreground tabular-nums">{currentProduct.affectedRows}</p>
                    <p className="text-xs text-muted-foreground">
                      {currentProduct.affectedRows === 1 ? 'fila' : 'filas'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Search input */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Refinar búsqueda en DIS
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={currentProduct.product}
                    className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm
                               placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none
                               focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Las sugerencias se cargan automáticamente. Escriba aquí para ajustar la búsqueda.
                </p>
              </div>

              {/* Suggestions */}
              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Coincidencias en DIS
                  {loadingSuggestions && (
                    <span className="ml-2 text-muted-foreground font-normal">cargando...</span>
                  )}
                </p>

                {!loadingSuggestions && suggestions.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
                    <p className="text-sm text-muted-foreground">Sin coincidencias en el catálogo DIS</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Intente refinar la búsqueda con el nombre del medicamento o marca
                    </p>
                  </div>
                )}

                {suggestions.length > 0 && (
                  <div className="rounded-lg border border-border overflow-hidden divide-y divide-border">
                    {suggestions.map((s) => (
                      <button
                        key={s.code}
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleAssign(s)}
                        className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left
                                   hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed
                                   transition-colors duration-100 group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground leading-snug break-words group-hover:text-primary transition-colors">
                            {s.product}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">CUM: {s.cum}</p>
                        </div>
                        <div className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-primary
                                        opacity-0 group-hover:opacity-100 transition-opacity">
                          {assignMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          Seleccionar
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Skip */}
              <div className="flex justify-end pt-2 border-t border-border">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={handleSkip}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-input text-xs
                             font-medium text-muted-foreground cursor-pointer hover:bg-muted
                             hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all duration-150"
                >
                  {skipMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <SkipForward className="h-3.5 w-3.5" />
                  )}
                  No aplica CUM — Saltar
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
