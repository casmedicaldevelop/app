import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tvInsEventoService } from '../services/tvins-evento.service'
import type {
  CreateTvInsEventoPayload,
  ListTvInsEventoParams,
  UpdateTvInsEventoPayload,
} from '../types/tvins-evento.types'

const KEY = 'tvins-evento'

export function useTvInsEventoList(params: ListTvInsEventoParams = {}) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => tvInsEventoService.list(params),
  })
}

export function useCreateTvInsEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTvInsEventoPayload) => tvInsEventoService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success('Registro creado correctamente')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Error al crear el registro')
    },
  })
}

export function useUpdateTvInsEvento(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateTvInsEventoPayload) => tvInsEventoService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success('Cambios guardados')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudieron guardar los cambios')
    },
  })
}

export function useDeleteTvInsEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => tvInsEventoService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success('Registro eliminado')
    },
    onError: () => {
      toast.error('No se pudo eliminar el registro')
    },
  })
}

export function useBulkUploadTvInsEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => tvInsEventoService.bulkUpload(file),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success(`Carga completada: ${res.inserted} registros insertados`)
    },
    // El detalle del error (fila + columna + motivo) se muestra dentro del modal de carga.
  })
}

export function useUpdatePreviewTvInsEvento() {
  return useMutation({
    mutationFn: (file: File) => tvInsEventoService.updatePreview(file),
  })
}

export function useUpdateApplyTvInsEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (items: { id: number; value: number }[]) => tvInsEventoService.updateApply(items),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success(`Actualizados: ${res.updated} registros`)
    },
  })
}
