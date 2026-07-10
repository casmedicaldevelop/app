import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tvMedEventoService } from '../services/tvmed-evento.service'
import type {
  CreateTvMedEventoPayload,
  ListTvMedEventoParams,
  UpdateTvMedEventoPayload,
} from '../types/tvmed-evento.types'

const KEY = 'tvmed-evento'

export function useTvMedEventoList(params: ListTvMedEventoParams = {}) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => tvMedEventoService.list(params),
  })
}

export function useCreateTvMedEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTvMedEventoPayload) => tvMedEventoService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success('Registro creado correctamente')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Error al crear el registro')
    },
  })
}

export function useUpdateTvMedEvento(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateTvMedEventoPayload) => tvMedEventoService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success('Cambios guardados')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudieron guardar los cambios')
    },
  })
}

export function useDeleteTvMedEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => tvMedEventoService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success('Registro eliminado')
    },
    onError: () => {
      toast.error('No se pudo eliminar el registro')
    },
  })
}

export function useBulkUploadTvMedEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => tvMedEventoService.bulkUpload(file),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success(`Carga completada: ${res.inserted} registros insertados`)
    },
    // El detalle del error (fila + columna + motivo) se muestra dentro del modal de carga.
  })
}

export function useUpdatePreviewTvMedEvento() {
  return useMutation({
    mutationFn: (file: File) => tvMedEventoService.updatePreview(file),
  })
}

export function useUpdateApplyTvMedEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (items: { id: number; value: number }[]) => tvMedEventoService.updateApply(items),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success(`Actualizados: ${res.updated} registros`)
    },
  })
}
