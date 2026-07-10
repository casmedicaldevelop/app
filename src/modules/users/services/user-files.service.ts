import { apiFetch, apiFetchBlob, apiFetchUpload } from '../../../lib/api-fetch'
import type {
  DriveFileItem,
  FilesListResponse,
  FolderNode,
} from '../../filing-mipres/services/filing-mipres.service'

/**
 * Gestor de archivos por usuario, directo contra Drive (raíz USERS/{cédula}).
 * Mismas firmas que filingMipresService para reusar el componente FilesManager.
 */
export const userFilesService = {
  filesRoot(id: string): Promise<FilesListResponse> {
    return apiFetch<FilesListResponse>(`/users/${encodeURIComponent(id)}/files`)
  },

  filesList(id: string, folderId: string): Promise<FilesListResponse> {
    return apiFetch<FilesListResponse>(`/users/${encodeURIComponent(id)}/files/${folderId}`)
  },

  filesTree(id: string): Promise<{ rootId: string; tree: FolderNode[] }> {
    return apiFetch<{ rootId: string; tree: FolderNode[] }>(`/users/${encodeURIComponent(id)}/files-tree`)
  },

  createFolder(id: string, folderId: string, name: string): Promise<DriveFileItem> {
    return apiFetch<DriveFileItem>(`/users/${encodeURIComponent(id)}/files/${folderId}/folders`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  },

  uploadFile(id: string, folderId: string, file: File): Promise<DriveFileItem> {
    const form = new FormData()
    form.append('file', file)
    return apiFetchUpload<DriveFileItem>(`/users/${encodeURIComponent(id)}/files/${folderId}`, form)
  },

  async deleteItem(id: string, itemId: string): Promise<void> {
    await apiFetch(`/users/${encodeURIComponent(id)}/files/${itemId}`, { method: 'DELETE' })
  },

  fileBlob(
    id: string,
    itemId: string,
    disposition: 'inline' | 'attachment' = 'inline',
  ): Promise<Blob> {
    return apiFetchBlob(`/users/${encodeURIComponent(id)}/files/${itemId}/content?disposition=${disposition}`)
  },

  driveQuota(): Promise<{ limitBytes: number | null; usageBytes: number }> {
    return apiFetch<{ limitBytes: number | null; usageBytes: number }>(`/users/drive-quota`)
  },
}
