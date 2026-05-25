import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Database, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTvMedItem } from '../hooks/useTvMedItem'
import { useUpdateTvMed } from '../hooks/useUpdateTvMed'
import type { UpdateTvMedPayload } from '../types/tv-med.types'

interface EditForm {
  code: string
  name: string
}

const inputBase = [
  'h-11 w-full rounded-lg border bg-background px-3.5 text-sm',
  'focus:outline-none focus:ring-2 transition-colors',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')

const inputNormal = `${inputBase} border-input hover:border-ring/60 focus:border-primary focus:ring-primary/20`
const inputError  = `${inputBase} border-destructive hover:border-destructive focus:border-destructive focus:ring-destructive/20`

export default function TvMedEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const numericId = id ? parseInt(id, 10) : 0
  const mutation = useUpdateTvMed(numericId)

  const { data: record, isLoading, isError } = useTvMedItem(numericId)

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<EditForm>()

  useEffect(() => {
    if (record) {
      reset({ code: record.code, name: record.name })
    }
  }, [record, reset])

  const onSubmit = handleSubmit((data) => {
    const payload: UpdateTvMedPayload = {
      code: data.code.trim(),
      name: data.name.trim(),
    }
    mutation.mutate(payload, {
      onSuccess: () => navigate('/dashboard/tv-med'),
    })
  })

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-background shadow-sm animate-pulse">
        <div className="px-6 pt-5 pb-5 border-b border-border space-y-4">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-muted rounded-lg shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-48 bg-muted rounded" />
              <div className="h-3.5 w-16 bg-muted rounded" />
            </div>
          </div>
        </div>
        <div className="px-6 py-6 space-y-5">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-11 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-border bg-muted/20 rounded-b-xl flex justify-end gap-3">
          <div className="h-11 w-24 bg-muted rounded-lg" />
          <div className="h-11 w-36 bg-muted rounded-lg" />
        </div>
      </div>
    )
  }

  if (isError || !record) {
    return (
      <div className="rounded-xl border border-border bg-background shadow-sm p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto mb-3">
          <AlertCircle className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-foreground">Registro no encontrado</p>
        <p className="text-xs text-muted-foreground mt-1">
          El registro con id <span className="font-mono">{numericId}</span> no existe.
        </p>
        <button
          type="button"
          onClick={() => navigate('/dashboard/tv-med')}
          className="mt-4 text-sm text-primary hover:underline cursor-pointer"
        >
          Volver a TvMed
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-background shadow-sm">

      <div className="px-6 pt-5 pb-5 border-b border-border space-y-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard/tv-med')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a TvMed
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Database className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{record.name}</h1>
            <p className="text-sm text-muted-foreground font-mono">#{record.id}</p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate>
        <div className="px-6 py-6 space-y-5">

          {mutation.isError && (
            <div role="alert" className="flex items-start gap-2.5 rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                {(mutation.error as { message?: string })?.message ?? 'No se pudieron guardar los cambios'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="tve-code" className="block text-sm font-medium text-foreground">
                Código <span className="text-destructive">*</span>
              </label>
              <input
                id="tve-code"
                autoComplete="off"
                aria-invalid={!!errors.code}
                {...register('code', { required: 'El código es requerido' })}
                disabled={mutation.isPending}
                className={errors.code ? inputError : inputNormal}
              />
              {errors.code && (
                <p role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.code.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tve-name" className="block text-sm font-medium text-foreground">
                Nombre <span className="text-destructive">*</span>
              </label>
              <input
                id="tve-name"
                autoComplete="off"
                aria-invalid={!!errors.name}
                {...register('name', { required: 'El nombre es requerido' })}
                disabled={mutation.isPending}
                className={errors.name ? inputError : inputNormal}
              />
              {errors.name && (
                <p role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.name.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20 rounded-b-xl">
          <button
            type="button"
            onClick={() => navigate('/dashboard/tv-med')}
            disabled={mutation.isPending}
            className="h-11 px-5 rounded-lg border border-input text-sm font-medium cursor-pointer
                       hover:bg-muted active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={mutation.isPending || !isDirty}
            className="h-11 px-6 rounded-lg bg-primary text-sm font-semibold text-primary-foreground cursor-pointer
                       hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
                       transition-all flex items-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                Guardando...
              </>
            ) : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
