import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { eventContractService } from '../services/event-contract.service'
import type { CreateEventContractPayload, FinalizeEventContractPayload } from '../types/event-contract.types'

const KEY = 'event-contract'

export function useEventContracts() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => eventContractService.list(),
  })
}

export function useActiveEventContract() {
  return useQuery({
    queryKey: [KEY, 'active'],
    queryFn: () => eventContractService.active(),
  })
}

export function useEventContract(id: number) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => eventContractService.getById(id),
    enabled: Number.isFinite(id),
  })
}

export function useCreateEventContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateEventContractPayload) => eventContractService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success('Contrato creado')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo crear el contrato')
    },
  })
}

export function useSetContractOpen() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isOpen }: { id: number; isOpen: boolean }) =>
      eventContractService.setOpen(id, isOpen),
    onSuccess: (_data, { isOpen }) => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success(isOpen ? 'Contrato abierto' : 'Contrato cerrado')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo cambiar el estado del contrato')
    },
  })
}

export function useFinalizeEventContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FinalizeEventContractPayload }) =>
      eventContractService.finalize(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success('Contrato finalizado')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo finalizar el contrato')
    },
  })
}
