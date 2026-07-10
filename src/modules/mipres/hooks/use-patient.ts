import { useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { serviceUsersService } from '../../users/services/service-users.service'
import { sessionService } from '../services/session.service'
import { extractMessage } from '../utils/error.helpers'
import type {
  CreateServiceUserPayload,
  UpdateServiceUserPayload,
} from '../../users/types/service-user.types'
import type { WorkspaceResponse } from '../types/shared.types'
import type { RegisterPatientFormValues } from '../types/patient.types'

interface UsePatientArgs {
  workspace: WorkspaceResponse | null
  setWorkspace: (w: WorkspaceResponse | null) => void
}

export function usePatient({ workspace, setWorkspace }: UsePatientArgs) {
  const registerMutation = useMutation({
    mutationFn: async (vars: {
      payload: CreateServiceUserPayload
      prescriptionNumber: string
    }) => {
      await serviceUsersService.create(vars.payload)
      return sessionService.loadWorkspace(vars.prescriptionNumber)
    },
    onSuccess: (data) => {
      setWorkspace(data)
      toast.success('Paciente registrado')
    },
    onError: (err) => {
      toast.error(extractMessage(err))
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (vars: {
      id: string
      payload: UpdateServiceUserPayload
      prescriptionNumber: string
    }) => {
      await serviceUsersService.update(vars.id, vars.payload)
      return sessionService.loadWorkspace(vars.prescriptionNumber)
    },
    onSuccess: (data) => {
      setWorkspace(data)
      toast.success('Paciente actualizado')
    },
    onError: (err) => {
      toast.error(extractMessage(err))
    },
  })

  const updatePatient = useCallback(
    async (payload: UpdateServiceUserPayload) => {
      if (!workspace || workspace.patient?.exists !== true) {
        toast.error('No hay paciente registrado para actualizar')
        return
      }
      await updateMutation.mutateAsync({
        id: workspace.patient.user.id,
        payload,
        prescriptionNumber: workspace.prescriptionNumber,
      })
    },
    [workspace, updateMutation],
  )

  const buildBirth = (form: RegisterPatientFormValues): {
    birthDate?: string
    birthDateApproximate: boolean
  } => {
    if (form.birthMode === 'age' && form.age != null && !Number.isNaN(form.age)) {
      const targetYear = new Date().getFullYear() - form.age
      return {
        birthDate: `${String(targetYear).padStart(4, '0')}-01-01`,
        birthDateApproximate: true,
      }
    }
    if (form.birthMode === 'exact' && form.birthDate) {
      return { birthDate: form.birthDate, birthDateApproximate: false }
    }
    return { birthDateApproximate: false }
  }

  const registerPatient = useCallback(
    async (form: RegisterPatientFormValues) => {
      if (!workspace || !workspace.patient || workspace.patient.exists !== false) {
        toast.error('No hay datos de paciente nuevo para registrar')
        return
      }
      const fromMipres = workspace.patient.fromMipres
      const { birthDate, birthDateApproximate } = buildBirth(form)

      const payload: CreateServiceUserPayload = {
        id: fromMipres.noDoc,
        ...(form.documentType ? { documentType: form.documentType } : {}),
        ...(form.gender ? { gender: form.gender } : {}),
        firstName: form.firstName.trim(),
        firstSurname: form.firstSurname.trim(),
        phone: form.phone.trim(),
        ...(form.secondName?.trim() ? { secondName: form.secondName.trim() } : {}),
        ...(form.secondSurname?.trim() ? { secondSurname: form.secondSurname.trim() } : {}),
        ...(form.email?.trim() ? { email: form.email.trim() } : {}),
        ...(birthDate ? { birthDate, birthDateApproximate } : {}),
        ...(form.healthcareRegime ? { healthcareRegime: form.healthcareRegime } : {}),
        ...(form.city?.trim() ? { city: form.city.trim() } : {}),
        ...(form.neighborhood?.trim() ? { neighborhood: form.neighborhood.trim() } : {}),
        ...(form.address?.trim() ? { address: form.address.trim() } : {}),
        ...(form.description?.trim() ? { description: form.description.trim() } : {}),
      }
      await registerMutation.mutateAsync({
        payload,
        prescriptionNumber: workspace.prescriptionNumber,
      })
    },
    [workspace, registerMutation],
  )

  const completePatient = useCallback(
    async (form: RegisterPatientFormValues) => {
      if (!workspace || workspace.patient?.exists !== true) {
        toast.error('No hay paciente registrado para completar')
        return
      }
      const { birthDate, birthDateApproximate } = buildBirth(form)

      const payload: UpdateServiceUserPayload = {
        ...(form.documentType ? { documentType: form.documentType } : {}),
        ...(form.gender ? { gender: form.gender } : {}),
        firstName: form.firstName.trim(),
        firstSurname: form.firstSurname.trim(),
        phone: form.phone.trim(),
        ...(form.secondName?.trim() ? { secondName: form.secondName.trim() } : {}),
        ...(form.secondSurname?.trim() ? { secondSurname: form.secondSurname.trim() } : {}),
        ...(form.email?.trim() ? { email: form.email.trim() } : {}),
        ...(birthDate ? { birthDate, birthDateApproximate } : {}),
        ...(form.healthcareRegime ? { healthcareRegime: form.healthcareRegime } : {}),
        ...(form.city?.trim() ? { city: form.city.trim() } : {}),
        ...(form.neighborhood?.trim() ? { neighborhood: form.neighborhood.trim() } : {}),
        ...(form.address?.trim() ? { address: form.address.trim() } : {}),
        ...(form.description?.trim() ? { description: form.description.trim() } : {}),
      }
      await updateMutation.mutateAsync({
        id: workspace.patient.user.id,
        payload,
        prescriptionNumber: workspace.prescriptionNumber,
      })
    },
    [workspace, updateMutation],
  )

  return {
    registerPatient,
    completePatient,
    updatePatient,
    registerSubmitting: registerMutation.isPending,
    updateSubmitting: updateMutation.isPending,
  }
}
