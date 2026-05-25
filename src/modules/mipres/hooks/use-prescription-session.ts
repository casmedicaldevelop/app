import { useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useCompany } from '../../company/hooks/useCompany'
import { sessionService } from '../services/session.service'
import { extractMessage } from '../utils/error.helpers'
import type { MipresTool, WorkspaceResponse } from '../types/shared.types'

/**
 * Hook that owns the *session* state of a prescription being worked on:
 * the input, the loaded workspace (routings + patient resolution), the
 * generic error from the gate, and which tool is currently active.
 *
 * No domain-specific mutations live here. Each domain hook (use-routings,
 * use-schedules, use-deliveries, use-patient) is composed alongside this one
 * by the page.
 */
export function usePrescriptionSession() {
  const [prescriptionInput, setPrescriptionInput] = useState('')
  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTool, setActiveTool] = useState<MipresTool>('routings')
  const { data: company } = useCompany()

  const loadMutation = useMutation({
    mutationFn: (np: string) => sessionService.loadWorkspace(np),
    onSuccess: (data) => {
      setWorkspace(data)
      setError(null)
      setActiveTool('routings')
    },
    onError: (err) => {
      setError(extractMessage(err))
      setWorkspace(null)
    },
  })

  const loadPrescription = useCallback(
    (np: string) => {
      const trimmed = np.trim()
      if (!trimmed) return
      loadMutation.mutate(trimmed)
    },
    [loadMutation],
  )

  const clearPrescription = useCallback(() => {
    setPrescriptionInput('')
    setWorkspace(null)
    setError(null)
    loadMutation.reset()
  }, [loadMutation])

  return {
    prescriptionInput,
    setPrescriptionInput,
    workspace,
    setWorkspace,
    error,
    loading: loadMutation.isPending,
    loadPrescription,
    clearPrescription,
    activeTool,
    setActiveTool,
    companyConfigured: !!company?.nit && !!company?.codeProvider,
    company,
  }
}
