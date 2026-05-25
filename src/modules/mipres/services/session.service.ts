import { apiFetch } from '../../../lib/api-fetch'
import { recordRequest } from '../../../lib/request-log'
import type { WorkspaceResponse } from '../types/shared.types'

export const SESSION_DEBUG_KEYS = {
  loadWorkspace: 'mipres:load-workspace',
} as const

export const sessionService = {
  async loadWorkspace(prescriptionNumber: string): Promise<WorkspaceResponse> {
    return apiFetch<WorkspaceResponse>(
      `/mipres/prescription/${encodeURIComponent(prescriptionNumber)}/workspace`,
      undefined,
      { onMeta: (meta) => recordRequest(SESSION_DEBUG_KEYS.loadWorkspace, meta) },
    )
  },
}
