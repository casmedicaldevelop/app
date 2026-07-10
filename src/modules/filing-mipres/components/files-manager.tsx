import { Fragment, useMemo, useRef, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Download,
  Eye,
  File as FileIcon,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderPlus,
  Image as ImageIcon,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-react'
import type { DriveFileItem, FolderNode, FilesListResponse } from '../services/filing-mipres.service'

export interface FilesManagerService {
  filesRoot(id: number | string): Promise<FilesListResponse>
  filesList(id: number | string, folderId: string): Promise<FilesListResponse>
  filesTree(id: number | string): Promise<{ rootId: string; tree: FolderNode[] }>
  createFolder(id: number | string, folderId: string, name: string): Promise<DriveFileItem>
  uploadFile(id: number | string, folderId: string, file: File): Promise<DriveFileItem>
  deleteItem(id: number | string, itemId: string): Promise<void>
  fileBlob(id: number | string, itemId: string, disposition?: 'inline' | 'attachment'): Promise<Blob>
  driveQuota(): Promise<{ limitBytes: number | null; usageBytes: number }>
}

function errMsg(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message)
  return 'Error'
}
function isPreviewable(mime: string): boolean {
  return mime.startsWith('image/') || mime === 'application/pdf'
}
function fmtBytes(n?: number): string {
  if (n == null || !Number.isFinite(n)) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1048576) return `${Math.round(n / 1024)} KB`
  if (n < 1073741824) return `${(n / 1048576).toFixed(1)} MB`
  return `${(n / 1073741824).toFixed(1)} GB`
}
function fmtDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()}, ${p(d.getHours())}:${p(d.getMinutes())}`
}
// Ícono por tipo: doc/html azul, zip ámbar, imagen/texto gris, hoja verde.
function fileIcon(item: DriveFileItem): { Icon: typeof FileIcon; cls: string } {
  const m = item.mimeType
  const name = item.name.toLowerCase()
  if (m.startsWith('image/')) return { Icon: ImageIcon, cls: 'text-slate-400' }
  if (m === 'application/pdf') return { Icon: FileText, cls: 'text-[#ee5253]' }
  if (name.endsWith('.zip') || name.endsWith('.rar') || m.includes('zip'))
    return { Icon: FileArchive, cls: 'text-amber-400' }
  if (m.includes('sheet') || m.includes('excel') || name.endsWith('.csv'))
    return { Icon: FileSpreadsheet, cls: 'text-emerald-600' }
  if (name.endsWith('.html') || m.includes('html')) return { Icon: FileText, cls: 'text-blue-500' }
  if (name.endsWith('.txt') || m.startsWith('text/')) return { Icon: FileText, cls: 'text-slate-400' }
  return { Icon: FileIcon, cls: 'text-blue-500' }
}

export function FilesManager({ entityId, service, queryNs }: { entityId: number | string; service: FilesManagerService; queryNs: string }) {
  const qc = useQueryClient()
  const [folderId, setFolderId] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [createMenu, setCreateMenu] = useState(false)
  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [toDelete, setToDelete] = useState<DriveFileItem | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: [`${queryNs}-files`, entityId, folderId],
    queryFn: () =>
      folderId
        ? service.filesList(entityId, folderId)
        : service.filesRoot(entityId),
    // staleTime 0 + refetchOnMount: refleja el estado actual de Drive cada vez
    // que se abre el gestor (incluye lo creado/subido a mano), sin spamear.
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  })

  // Árbol de carpetas: se refresca al abrir el gestor (no en cada foco).
  const treeQ = useQuery({
    queryKey: [`${queryNs}-files-tree`, entityId],
    queryFn: () => service.filesTree(entityId),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  })

  const quota = useQuery({
    queryKey: ['drive-quota'],
    queryFn: () => service.driveQuota(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  const currentId = data?.folderId
  const atRoot = !folderId
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: [`${queryNs}-files`, entityId] })
    qc.invalidateQueries({ queryKey: [`${queryNs}-files-tree`, entityId] })
  }

  const createMut = useMutation({
    mutationFn: (name: string) => service.createFolder(entityId, currentId!, name),
    onSuccess: () => { invalidate(); setNewFolderOpen(false); setNewFolderName(''); toast.success('Carpeta creada') },
    onError: (e) => toast.error(errMsg(e)),
  })
  const uploadMut = useMutation({
    mutationFn: (file: File) => service.uploadFile(entityId, currentId!, file),
    onSuccess: () => { invalidate(); toast.success('Archivo subido') },
    onError: (e) => toast.error(errMsg(e)),
  })
  const deleteMut = useMutation({
    mutationFn: (itemId: string) => service.deleteItem(entityId, itemId),
    onSuccess: () => {
      invalidate(); setToDelete(null)
      toast.success('Eliminado')
    },
    onError: (e) => toast.error(errMsg(e)),
  })


  const openPreview = async (item: DriveFileItem) => {
    setMenuId(null)
    if (!isPreviewable(item.mimeType)) { toast.message('Solo imagen y PDF se previsualizan. Usá Descargar.'); return }
    try {
      const blob = await service.fileBlob(entityId, item.id, 'inline')
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (e) { toast.error(errMsg(e)) }
  }
  const download = async (item: DriveFileItem) => {
    setMenuId(null)
    try {
      const blob = await service.fileBlob(entityId, item.id, 'attachment')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = item.name; a.click()
      URL.revokeObjectURL(url)
    } catch (e) { toast.error(errMsg(e)) }
  }
  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (file) uploadMut.mutate(file); e.target.value = ''
  }

  const folders = useMemo(
    () => (data?.items ?? []).filter((i) => i.isFolder && i.name.toLowerCase().includes(q.toLowerCase())),
    [data, q],
  )
  const files = useMemo(
    () => (data?.items ?? []).filter((i) => !i.isFolder && i.name.toLowerCase().includes(q.toLowerCase())),
    [data, q],
  )
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const renderTree = (nodes: FolderNode[], depth: number): ReactNode =>
    nodes.map((n) => {
      const hasChildren = n.children.length > 0
      const isOpen = expanded.has(n.id)
      const isCurrent = n.id === currentId
      return (
        <Fragment key={n.id}>
          <div
            style={{ paddingLeft: `${4 + depth * 14}px` }}
            className={`flex items-center gap-0.5 rounded-lg pr-1 ${isCurrent ? 'bg-muted' : 'hover:bg-muted'}`}
          >
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(n.id)}
                aria-label={isOpen ? 'Colapsar' : 'Expandir'}
                className="grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded text-slate-400 hover:text-foreground"
              >
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <span className="w-6 shrink-0" />
            )}
            <button
              type="button"
              onClick={() => setFolderId(n.id)}
              className={`min-w-0 flex-1 cursor-pointer truncate py-2 text-left text-[14px] ${
                isCurrent ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'
              }`}
            >
              {n.name}
            </button>
          </div>
          {hasChildren && isOpen && renderTree(n.children, depth + 1)}
        </Fragment>
      )
    })

  return (
    <div className="relative flex h-full min-h-0 bg-background text-foreground">
      {/* ===== Sidebar ===== */}
      <aside className="flex w-[300px] shrink-0 flex-col gap-7 overflow-y-auto border-r border-border px-6 py-7">
        <div className="relative">
          <button
            type="button"
            onClick={() => setCreateMenu((v) => !v)}
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg bg-[#2d3436] text-sm font-semibold text-white transition-colors hover:bg-[#3a4042]"
          >
            <Plus className="h-[18px] w-[18px]" /> Crear nuevo
          </button>
          {createMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setCreateMenu(false)} />
              <div className="absolute left-0 right-0 top-14 z-20 overflow-hidden rounded-lg border border-border bg-background shadow-lg">
                <button type="button" disabled={!currentId} onClick={() => { setCreateMenu(false); setNewFolderOpen(true) }}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-3 text-sm font-medium hover:bg-muted disabled:opacity-50">
                  <FolderPlus className="h-4 w-4 text-amber-400" /> Nueva carpeta
                </button>
                <button type="button" disabled={!currentId || uploadMut.isPending} onClick={() => { setCreateMenu(false); fileInputRef.current?.click() }}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-3 text-sm font-medium hover:bg-muted disabled:opacity-50">
                  <Upload className="h-4 w-4 text-blue-500" /> Subir archivo
                </button>
              </div>
            </>
          )}
          <input ref={fileInputRef} type="file" className="hidden" onChange={onPickFile} />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setFolderId(null)}
            className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-1 py-1.5 text-[14px] hover:bg-muted ${
              atRoot ? 'font-bold text-foreground' : 'font-semibold text-foreground'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Folder className="h-[18px] w-[18px] fill-amber-400 text-amber-400" /> Archivos
            </span>
            <ChevronUp className="h-4 w-4 text-slate-400" />
          </button>
          <div className="mt-2 flex flex-col gap-0.5">
            {treeQ.data && treeQ.data.tree.length > 0 ? (
              renderTree(treeQ.data.tree, 0)
            ) : (
              <span className="px-2.5 py-2 text-[14px] text-slate-400">Sin subcarpetas</span>
            )}
          </div>
        </div>
      </aside>

      {/* ===== Main ===== */}
      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-4 px-8 pb-4 pt-7">
          <div className="min-w-0">
            {quota.data && (
              <>
                <div className="text-[13px] font-semibold text-foreground">
                  {fmtBytes(quota.data.usageBytes)}
                  {quota.data.limitBytes != null ? ` de ${fmtBytes(quota.data.limitBytes)}` : ''} usados
                </div>
                {quota.data.limitBytes != null && (
                  <div className="mt-1.5 h-1.5 w-[260px] overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${Math.min(100, Math.round((quota.data.usageBytes / quota.data.limitBytes) * 100))}%` }}
                    />
                  </div>
                )}
                <div className="mt-1 text-[12px] text-muted-foreground">
                  {quota.data.limitBytes != null
                    ? `Disponible: ${fmtBytes(quota.data.limitBytes - quota.data.usageBytes)}`
                    : 'Almacenamiento ilimitado'}
                </div>
              </>
            )}
          </div>
          <div className="flex h-[46px] w-[320px] items-center gap-2.5 rounded-lg border border-input bg-background px-4 text-slate-400 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30">
            <Search className="h-[18px] w-[18px]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..."
              className="w-full border-none bg-transparent text-sm text-foreground outline-none placeholder:text-slate-400" />
          </div>
        </div>

        <div className="flex-1 overflow-auto px-8 pb-8">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-slate-400"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando…</div>
          ) : isError ? (
            <div className="flex h-full items-center justify-center text-slate-400">No se pudo cargar.</div>
          ) : (
            <>
              {folders.length > 0 && (
                <div className="mb-2 grid grid-cols-3 gap-4 pt-2">
                  {folders.map((f) => (
                    <div key={f.id} onClick={() => setFolderId(f.id)}
                      className="cursor-pointer rounded-lg border border-border p-4 transition hover:shadow-[0_6px_18px_rgba(16,24,40,.06)]">
                      <div className="flex items-start justify-between">
                        <Folder className="h-8 w-8 fill-amber-400 text-amber-400" />
                        <button type="button" onClick={(e) => { e.stopPropagation(); setToDelete(f) }}
                          className="cursor-pointer rounded p-1 text-slate-400 hover:text-[#ee5253]" title="Eliminar carpeta">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="mt-3 truncate text-[14px] font-semibold">{f.name}</div>
                      <div className="mt-1 flex items-center justify-between text-[13px] text-muted-foreground">
                        <span>{String(f.childCount ?? 0).padStart(2, '0')} archivos</span>
                        <span>{fmtBytes(f.folderSizeBytes)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 grid grid-cols-[1fr_240px_140px_44px] items-center gap-3 border-t border-border px-2 pb-3 pt-6 text-[14px] font-semibold text-foreground">
                <div>Nombre</div><div>Fecha de modificación</div><div>Tamaño</div><div></div>
              </div>

              {files.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">No hay archivos en esta carpeta.</div>
              ) : (
                files.map((f) => {
                  const { Icon, cls } = fileIcon(f)
                  return (
                    <div key={f.id} onClick={() => openPreview(f)}
                      className="grid cursor-pointer grid-cols-[1fr_240px_140px_44px] items-center gap-3 border-b border-border px-2 py-4 hover:bg-muted/60">
                      <div className="flex min-w-0 items-center gap-3.5">
                        <Icon className={`h-5 w-5 shrink-0 ${cls}`} />
                        <span className="truncate text-[14px] font-medium">{f.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{fmtDate(f.modifiedTime)}</div>
                      <div className="text-sm text-muted-foreground">{fmtBytes(f.size ? Number(f.size) : undefined)}</div>
                      <div className="relative justify-self-center">
                        <button type="button" onClick={(e) => { e.stopPropagation(); setMenuId((m) => (m === f.id ? null : f.id)) }}
                          className="cursor-pointer rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                        {menuId === f.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuId(null) }} />
                            <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-lg border border-border bg-background shadow-lg" onClick={(e) => e.stopPropagation()}>
                              {isPreviewable(f.mimeType) && (
                                <button type="button" onClick={() => openPreview(f)} className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm font-medium hover:bg-muted">
                                  <Eye className="h-4 w-4 text-slate-500" /> Previsualizar
                                </button>
                              )}
                              <button type="button" onClick={() => download(f)} className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm font-medium hover:bg-muted">
                                <Download className="h-4 w-4 text-slate-500" /> Descargar
                              </button>
                              <button type="button" onClick={() => { setMenuId(null); setToDelete(f) }} className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#ee5253] hover:bg-red-50">
                                <Trash2 className="h-4 w-4" /> Eliminar
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </>
          )}
        </div>
      </section>

      {/* Modal nueva carpeta */}
      {newFolderOpen && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40" onClick={() => setNewFolderOpen(false)}>
          <div className="w-[360px] rounded-lg border border-border bg-background p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-base font-bold">Nueva carpeta</h3>
            <input autoFocus value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && newFolderName.trim()) createMut.mutate(newFolderName.trim()) }}
              placeholder="Nombre de la carpeta"
              className="h-10 w-full rounded-md border border-input px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setNewFolderOpen(false)} className="h-9 cursor-pointer rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">Cancelar</button>
              <button type="button" disabled={!newFolderName.trim() || createMut.isPending} onClick={() => createMut.mutate(newFolderName.trim())}
                className="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#2d3436] px-4 text-sm font-semibold text-white hover:bg-[#3a4042] disabled:cursor-not-allowed">
                {createMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar */}
      {toDelete && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40" onClick={() => setToDelete(null)}>
          <div className="w-[380px] rounded-lg border border-border bg-background p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 text-base font-bold">Eliminar {toDelete.isFolder ? 'carpeta' : 'archivo'}</h3>
            <p className="text-sm text-muted-foreground">¿Seguro que querés eliminar “{toDelete.name}”? {toDelete.isFolder && 'Se borra también su contenido.'} Esta acción no se puede deshacer.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setToDelete(null)} className="h-9 cursor-pointer rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">Cancelar</button>
              <button type="button" disabled={deleteMut.isPending} onClick={() => deleteMut.mutate(toDelete.id)}
                className="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#ee5253] px-4 text-sm font-semibold text-white hover:bg-[#d63e3e] disabled:opacity-50">
                {deleteMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
