import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, AlertCircle, Pencil, X, Check, Hash, CalendarDays, FolderOpen, Eye } from 'lucide-react'
import { useServiceUser } from '../hooks/useServiceUser'
import { useUpdateServiceUser } from '../hooks/useUpdateServiceUser'
import type { DocumentType, Gender, HealthcareRegime, UpdateServiceUserPayload } from '../types/service-user.types'
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS } from '../../mipres/utils/document-type'
import { UV_CSS } from './user-view.css'
import { FilesManager } from '../../filing-mipres/components/files-manager'
import { userFilesService } from '../services/user-files.service'
import { filingMipresService } from '../../filing-mipres/services/filing-mipres.service'

const FILING_STATUS_STYLES: Record<string, { wrap: string; dot: string }> = {
  PENDIENTE: { wrap: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  ENTREGADO: { wrap: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  ENTREGA_PARCIAL: { wrap: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
}

function FilingStatusPill({ status }: { status: string }) {
  const style = FILING_STATUS_STYLES[status] ?? { wrap: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground/60' }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-semibold whitespace-nowrap ${style.wrap}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
      {status}
    </span>
  )
}

type BirthMode = 'exact' | 'age'

interface FormState {
  documentType: '' | DocumentType
  gender: '' | Gender
  firstName: string
  secondName: string
  firstSurname: string
  secondSurname: string
  phone: string
  email: string
  birthMode: BirthMode
  birthDate: string
  age: string
  healthcareRegime: '' | HealthcareRegime
  city: string
  neighborhood: string
  address: string
  description: string
  isActive: boolean
}

const EMPTY: FormState = {
  documentType: '', gender: '', firstName: '', secondName: '', firstSurname: '', secondSurname: '',
  phone: '', email: '', birthMode: 'exact', birthDate: '', age: '', healthcareRegime: '',
  city: '', neighborhood: '', address: '', description: '', isActive: true,
}

function nowYear() {
  return new Date().getFullYear()
}

function validate(f: FormState): Record<string, string> {
  const e: Record<string, string> = {}
  if (!f.documentType) e.documentType = 'Requerido'
  if (!f.gender) e.gender = 'Requerido'
  if (!f.firstName.trim()) e.firstName = 'Requerido'
  if (!f.secondName.trim()) e.secondName = 'Requerido'
  if (!f.firstSurname.trim()) e.firstSurname = 'Requerido'
  if (!f.secondSurname.trim()) e.secondSurname = 'Requerido'
  if (!f.phone.trim()) e.phone = 'Requerido'
  else if (!/^\d{10}$/.test(f.phone.trim())) e.phone = 'Debe tener 10 dígitos'
  if (!f.email.trim()) e.email = 'Requerido'
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) e.email = 'Email inválido'
  if (!f.healthcareRegime) e.healthcareRegime = 'Requerido'
  if (!f.city.trim()) e.city = 'Requerido'
  if (!f.neighborhood.trim()) e.neighborhood = 'Requerido'
  if (!f.address.trim()) e.address = 'Requerido'
  if (f.birthMode === 'exact') {
    if (!f.birthDate) e.birth = 'Requerido'
  } else {
    const a = parseInt(f.age, 10)
    if (!f.age || Number.isNaN(a)) e.birth = 'Requerido'
    else if (a < 1 || a > 120) e.birth = 'Edad inválida (1–120)'
  }
  return e
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  const d = iso.slice(0, 10).split('-')
  return d.length === 3 ? `${d[2]}/${d[1]}/${d[0]}` : '—'
}

const CSS = UV_CSS

export default function ServiceUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: user, isLoading, isError } = useServiceUser(id ?? '')
  const update = useUpdateServiceUser(id ?? '')

  // Radicaciones MIPRES asociadas al documento de este usuario.
  const filingsQ = useQuery({
    queryKey: ['user-filings', id],
    queryFn: () => filingMipresService.list({ userDocument: id, limit: 100 }),
    enabled: !!id,
    staleTime: 0,
    refetchOnWindowFocus: false,
  })

  const [editing, setEditing] = useState(false)
  const [filesOpen, setFilesOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function hydrate() {
    if (!user) return
    let birthMode: BirthMode = 'exact'
    let birthDate = ''
    let age = ''
    if (user.birthDate) {
      const iso = user.birthDate.slice(0, 10)
      const year = parseInt(user.birthDate.slice(0, 4), 10)
      if (user.birthDateApproximate && !Number.isNaN(year)) {
        birthMode = 'age'
        age = String(nowYear() - year)
      } else {
        birthMode = 'exact'
        birthDate = iso
      }
    }
    setForm({
      documentType: user.documentType ?? '',
      gender: user.gender ?? '',
      firstName: user.firstName,
      secondName: user.secondName ?? '',
      firstSurname: user.firstSurname,
      secondSurname: user.secondSurname ?? '',
      phone: user.phone,
      email: user.email ?? '',
      birthMode, birthDate, age,
      healthcareRegime: user.healthcareRegime ?? '',
      city: user.city ?? '',
      neighborhood: user.neighborhood ?? '',
      address: user.address ?? '',
      description: user.description ?? '',
      isActive: user.isActive,
    })
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { hydrate() }, [user])

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggleBirth() {
    setForm((f) => {
      if (f.birthMode === 'exact') {
        let age = f.age
        if (f.birthDate) {
          const y = parseInt(f.birthDate.slice(0, 4), 10)
          if (!Number.isNaN(y)) {
            const d = nowYear() - y
            if (d >= 1 && d <= 120) age = String(d)
          }
        }
        return { ...f, birthMode: 'age', age }
      }
      let birthDate = f.birthDate
      const a = parseInt(f.age, 10)
      if (!Number.isNaN(a)) {
        const ty = nowYear() - a
        const ey = f.birthDate ? parseInt(f.birthDate.slice(0, 4), 10) : NaN
        if (!f.birthDate || Number.isNaN(ey) || ey !== ty) {
          birthDate = `${String(ty).padStart(4, '0')}-01-01`
        }
      }
      return { ...f, birthMode: 'exact', birthDate }
    })
  }

  function cancel() {
    hydrate()
    setErrors({})
    setEditing(false)
  }

  function save() {
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    let birthDate: string | null = null
    let birthDateApproximate = false
    if (form.birthMode === 'age') {
      const a = parseInt(form.age, 10)
      if (!Number.isNaN(a)) {
        birthDate = `${String(nowYear() - a).padStart(4, '0')}-01-01`
        birthDateApproximate = true
      }
    } else if (form.birthDate) {
      birthDate = form.birthDate
      birthDateApproximate = false
    }

    const payload: UpdateServiceUserPayload = {
      ...(form.documentType ? { documentType: form.documentType } : {}),
      gender: form.gender || null,
      firstName: form.firstName.trim(),
      secondName: form.secondName.trim(),
      firstSurname: form.firstSurname.trim(),
      secondSurname: form.secondSurname.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      birthDate,
      birthDateApproximate,
      healthcareRegime: form.healthcareRegime || null,
      city: form.city.trim(),
      neighborhood: form.neighborhood.trim(),
      address: form.address.trim(),
      description: form.description.trim() || undefined,
      isActive: form.isActive,
    }
    update.mutate(payload, { onSuccess: () => setEditing(false) })
  }

  if (isLoading) {
    return (
      <div className="uv">
        <style>{CSS}</style>
        <div className="topbar"><span className="page-title">Detalle de usuario</span></div>
        <div className="content"><div className="section-title">Cargando…</div></div>
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="uv">
        <style>{CSS}</style>
        <div className="topbar">
          <div className="topbar-left">
            <button className="btn-back" type="button" onClick={() => navigate('/dashboard/usuarios')}>
              <ChevronLeft size={14} /> Volver
            </button>
            <span className="page-title">Detalle de usuario</span>
          </div>
        </div>
        <div className="content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingTop: 56, textAlign: 'center' }}>
          <AlertCircle size={32} color="#ee5253" />
          <div>
            <p style={{ fontWeight: 600 }}>Usuario no encontrado</p>
            <p style={{ color: '#636e72', fontSize: 12 }}>La cédula no corresponde a ningún usuario registrado</p>
          </div>
        </div>
      </div>
    )
  }

  const ed = editing

  return (
    <div className={`uv${editing ? ' editing' : ''}`}>
      <style>{CSS}</style>

      {/* TOP BAR */}
      <header className="topbar">
        <div className="topbar-left">
          <button className="btn-back" type="button" onClick={() => navigate('/dashboard/usuarios')}>
            <ChevronLeft size={14} /> Volver
          </button>
          <h1 className="page-title">Detalle de usuario</h1>
          {ed ? (
            <select className="field-input status-select" value={form.isActive ? '1' : '0'} onChange={(e) => set('isActive', e.target.value === '1')}>
              <option value="1">ACTIVO</option>
              <option value="0">INACTIVO</option>
            </select>
          ) : (
            <span className={`badge ${user.isActive ? 'badge-active' : 'badge-inactive'}`}>
              <span className="badge-dot" aria-hidden="true" />
              {user.isActive ? 'Activo' : 'Inactivo'}
            </span>
          )}
        </div>
        <div className="actions">
          {filesOpen ? (
            <button className="btn-cancel" type="button" onClick={() => setFilesOpen(false)}>
              <X size={14} /> Cerrar archivos
            </button>
          ) : editing ? (
            <>
              <button className="btn-cancel" type="button" onClick={cancel} disabled={update.isPending}>
                <X size={14} /> Cancelar
              </button>
              <button className="btn-edit" type="button" onClick={save} disabled={update.isPending}>
                <Check size={14} /> {update.isPending ? 'Guardando…' : 'Guardar'}
              </button>
            </>
          ) : (
            <>
              <button className="btn-cancel" type="button" onClick={() => setFilesOpen(true)}>
                <FolderOpen size={14} /> Archivos
              </button>
              <button className="btn-edit" type="button" onClick={() => setEditing(true)}>
                <Pencil size={14} /> Editar
              </button>
            </>
          )}
        </div>
      </header>

      {filesOpen ? (
        <div className="files-wrap">
          <FilesManager entityId={user.id} service={userFilesService} queryNs="user" />
        </div>
      ) : (
      <main className="content">
        <div className="field-grid">
          <div className="field">
            <span className="field-label">Tipo de documento{ed && <span className="req">*</span>}</span>
            {ed ? (
              <>
                <select className="field-input" value={form.documentType} onChange={(e) => set('documentType', e.target.value as FormState['documentType'])}>
                  <option value="" disabled>SELECCIONAR...</option>
                  {DOCUMENT_TYPES.map((code) => (
                    <option key={code} value={code}>{code} — {DOCUMENT_TYPE_LABELS[code]}</option>
                  ))}
                </select>
                {errors.documentType && <span className="err">{errors.documentType}</span>}
              </>
            ) : (
              <input className="field-input" value={user.documentType ?? '—'} disabled />
            )}
          </div>
          <div className="field">
            <span className="field-label">Cédula</span>
            <input className="field-input" value={user.id} disabled />
          </div>
          <div className="field">
            <span className="field-label">Primer nombre{ed && <span className="req">*</span>}</span>
            <input className="field-input" value={form.firstName} disabled={!ed} onChange={(e) => set('firstName', e.target.value)} />
            {ed && errors.firstName && <span className="err">{errors.firstName}</span>}
          </div>
          <div className="field">
            <span className="field-label">Segundo nombre{ed && <span className="req">*</span>}</span>
            <input className="field-input" value={form.secondName} disabled={!ed} onChange={(e) => set('secondName', e.target.value)} />
            {ed && errors.secondName && <span className="err">{errors.secondName}</span>}
          </div>
          <div className="field">
            <span className="field-label">Primer apellido{ed && <span className="req">*</span>}</span>
            <input className="field-input" value={form.firstSurname} disabled={!ed} onChange={(e) => set('firstSurname', e.target.value)} />
            {ed && errors.firstSurname && <span className="err">{errors.firstSurname}</span>}
          </div>
          <div className="field">
            <span className="field-label">Segundo apellido{ed && <span className="req">*</span>}</span>
            <input className="field-input" value={form.secondSurname} disabled={!ed} onChange={(e) => set('secondSurname', e.target.value)} />
            {ed && errors.secondSurname && <span className="err">{errors.secondSurname}</span>}
          </div>
          <div className="field">
            <span className="field-label">Género{ed && <span className="req">*</span>}</span>
            <select className="field-input" value={form.gender} disabled={!ed} onChange={(e) => set('gender', e.target.value as FormState['gender'])}>
              <option value="" disabled>SELECCIONAR...</option>
              <option value="MASCULINO">MASCULINO</option>
              <option value="FEMENINO">FEMENINO</option>
            </select>
            {ed && errors.gender && <span className="err">{errors.gender}</span>}
          </div>
          <div className="field">
            <span className="field-label">{form.birthMode === 'age' ? 'Edad aproximada' : 'Fecha de nacimiento'}{ed && <span className="req">*</span>}</span>
            {ed ? (
              <>
                <div className="birth-row">
                  {form.birthMode === 'exact' ? (
                    <input className="field-input" type="date" value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
                  ) : (
                    <input className="field-input" type="number" min={1} max={120} placeholder="Ej. 30" value={form.age} onChange={(e) => set('age', e.target.value)} />
                  )}
                  <button
                    type="button"
                    className="birth-toggle"
                    onClick={toggleBirth}
                    title={form.birthMode === 'exact' ? 'Cambiar a edad aproximada' : 'Cambiar a fecha exacta'}
                  >
                    {form.birthMode === 'exact' ? <Hash size={14} /> : <CalendarDays size={14} />}
                  </button>
                </div>
                {errors.birth && <span className="err">{errors.birth}</span>}
              </>
            ) : (
              <input className="field-input" value={`${fmtDate(user.birthDate)}${user.birthDateApproximate ? ' (aprox.)' : ''}`} disabled />
            )}
          </div>
          <div className="field">
            <span className="field-label">Teléfono{ed && <span className="req">*</span>}</span>
            <input className="field-input" type="tel" inputMode="numeric" maxLength={10} value={form.phone} disabled={!ed} onChange={(e) => set('phone', e.target.value)} />
            {ed && errors.phone && <span className="err">{errors.phone}</span>}
          </div>
          <div className="field">
            <span className="field-label">Correo{ed && <span className="req">*</span>}</span>
            <input className="field-input" type="email" value={form.email} disabled={!ed} onChange={(e) => set('email', e.target.value)} />
            {ed && errors.email && <span className="err">{errors.email}</span>}
          </div>
          <div className="field">
            <span className="field-label">Régimen{ed && <span className="req">*</span>}</span>
            <select className="field-input" value={form.healthcareRegime} disabled={!ed} onChange={(e) => set('healthcareRegime', e.target.value as FormState['healthcareRegime'])}>
              <option value="" disabled>SELECCIONAR...</option>
              <option value="CONTRIBUTIVO">CONTRIBUTIVO</option>
              <option value="SUBSIDIADO">SUBSIDIADO</option>
            </select>
            {ed && errors.healthcareRegime && <span className="err">{errors.healthcareRegime}</span>}
          </div>
          <div className="field">
            <span className="field-label">Ciudad{ed && <span className="req">*</span>}</span>
            <input className="field-input" value={form.city} disabled={!ed} onChange={(e) => set('city', e.target.value)} />
            {ed && errors.city && <span className="err">{errors.city}</span>}
          </div>
          <div className="field">
            <span className="field-label">Barrio{ed && <span className="req">*</span>}</span>
            <input className="field-input" value={form.neighborhood} disabled={!ed} onChange={(e) => set('neighborhood', e.target.value)} />
            {ed && errors.neighborhood && <span className="err">{errors.neighborhood}</span>}
          </div>
          <div className="field">
            <span className="field-label">Dirección{ed && <span className="req">*</span>}</span>
            <input className="field-input" value={form.address} disabled={!ed} onChange={(e) => set('address', e.target.value)} />
            {ed && errors.address && <span className="err">{errors.address}</span>}
          </div>
          <div className="field">
            <span className="field-label">Creado</span>
            <input className="field-input" value={fmtDate(user.createdAt)} disabled />
          </div>
          <div className="field">
            <span className="field-label">Actualizado</span>
            <input className="field-input" value={fmtDate(user.updatedAt)} disabled />
          </div>
          <div className="field field-span">
            <span className="field-label">Descripción</span>
            {ed ? (
              <textarea className="field-input" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
            ) : (
              <input className="field-input" value={form.description || '—'} disabled />
            )}
          </div>
        </div>

        {/* MiPres_Radicacion — radicaciones asociadas al documento del usuario */}
        <div className="section-title" style={{ marginTop: 24 }}>MiPres_Radicacion</div>
        <div className="mipres">
          {filingsQ.isLoading ? (
            <div className="mipres-empty">Cargando…</div>
          ) : filingsQ.isError ? (
            <div className="mipres-empty">No se pudieron cargar las radicaciones.</div>
          ) : (filingsQ.data?.data.length ?? 0) === 0 ? (
            <div className="mipres-empty">Sin radicaciones para este usuario.</div>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted/40">
                  <th scope="col" className="border border-border px-4 py-2.5 text-left text-sm font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Fecha</th>
                  <th scope="col" className="border border-border px-4 py-2.5 text-left text-sm font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Usuario</th>
                  <th scope="col" className="border border-border px-4 py-2.5 text-left text-sm font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Prescripción</th>
                  <th scope="col" className="border border-border px-4 py-2.5 text-left text-sm font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell whitespace-nowrap">Tec</th>
                  <th scope="col" className="border border-border px-4 py-2.5 text-left text-sm font-semibold uppercase tracking-wider text-muted-foreground">Medicamento</th>
                  <th scope="col" className="border border-border px-4 py-2.5 text-right text-sm font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell whitespace-nowrap">Cant</th>
                  <th scope="col" className="border border-border px-4 py-2.5 text-right text-sm font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell whitespace-nowrap">Entr</th>
                  <th scope="col" className="border border-border px-4 py-2.5 text-left text-sm font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                  <th scope="col" className="border border-border px-4 py-2.5 text-right text-sm font-semibold uppercase tracking-wider text-muted-foreground" />
                </tr>
              </thead>
              <tbody>
                {filingsQ.data!.data.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-muted/20">
                    <td className="border border-border px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                    <td className="border border-border px-4 py-3 font-mono text-foreground">{r.userDocument}</td>
                    <td className="border border-border px-4 py-3 font-mono text-foreground max-w-[180px] truncate hidden lg:table-cell" title={r.prescriptionNumber}>{r.prescriptionNumber}</td>
                    <td className="border border-border px-4 py-3 font-mono text-foreground hidden md:table-cell">{r.technologyCode}</td>
                    <td className="border border-border px-4 py-3 text-foreground max-w-[220px] truncate" title={r.medicationName}>{r.medicationName}</td>
                    <td className="border border-border px-4 py-3 text-right text-foreground tabular-nums hidden sm:table-cell">{r.quantityToDeliver}</td>
                    <td className="border border-border px-4 py-3 text-right text-foreground tabular-nums hidden sm:table-cell">{r.quantityDelivered}</td>
                    <td className="border border-border px-4 py-3"><FilingStatusPill status={r.status} /></td>
                    <td className="border border-border px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/dashboard/filing-mipres/${r.id}`)}
                        aria-label="Ver radicación"
                        title="Ver radicación"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
      )}
    </div>
  )
}
