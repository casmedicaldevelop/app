import { useEffect, useState } from 'react'
import { Building2, AlertCircle, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { useCompany } from '../hooks/useCompany'
import { useUpsertCompany } from '../hooks/useUpsertCompany'
import { useUpdateMipres } from '../hooks/useUpdateMipres'
import { useUpdateAi } from '../hooks/useUpdateAi'
import { useRefreshMipresToken } from '../hooks/useRefreshMipresToken'
import type { UpsertCompanyPayload, UpdateMipresPayload, UpdateAiPayload } from '../types/company.types'

type Tab = 'datos' | 'mipres' | 'ia'

interface CompanyForm {
  name: string
  nit: string
  email: string
  phone: string
  city: string
  address: string
}

interface CompanyErrors {
  name?: string
  nit?: string
  email?: string
}

interface MipresForm {
  tokenCompany: string
}

interface AiForm {
  aiApiKey: string
  aiModel: string
}

function validateCompany(form: CompanyForm): CompanyErrors {
  const errors: CompanyErrors = {}
  if (!form.name.trim()) errors.name = 'El nombre es requerido'
  if (!form.nit.trim()) errors.nit = 'El NIT es requerido'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'El correo electrónico no es válido'
  return errors
}

const INITIAL_COMPANY: CompanyForm = { name: '', nit: '', email: '', phone: '', city: '', address: '' }

export default function CompanyPage() {
  const [tab, setTab] = useState<Tab>('datos')

  const { data: company, isLoading, isError } = useCompany()
  const upsert = useUpsertCompany()
  const updateMipres = useUpdateMipres()
  const updateAi = useUpdateAi()
  const refreshToken = useRefreshMipresToken()

  const [companyForm, setCompanyForm] = useState<CompanyForm>(INITIAL_COMPANY)
  const [companyErrors, setCompanyErrors] = useState<CompanyErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof CompanyForm, boolean>>>({})

  const [mipresForm, setMipresForm] = useState<MipresForm>({ tokenCompany: '' })
  const [aiForm, setAiForm] = useState<AiForm>({ aiApiKey: '', aiModel: 'gemini-3-flash-preview' })
  const [showApiKey, setShowApiKey] = useState(false)

  const isNotConfigured = isError

  useEffect(() => {
    if (!company) return
    setCompanyForm({
      name: company.name,
      nit: company.nit,
      email: company.email ?? '',
      phone: company.phone ?? '',
      city: company.city ?? '',
      address: company.address ?? '',
    })
    setMipresForm({ tokenCompany: company.tokenCompany ?? '' })
    setAiForm({
      aiApiKey: '',
      aiModel: company.aiModel ?? 'gemini-3-flash-preview',
    })
  }, [company])

  function handleCompanyChange(field: keyof CompanyForm, value: string) {
    setCompanyForm((f) => ({ ...f, [field]: value }))
    if (touched[field]) {
      const errs = validateCompany({ ...companyForm, [field]: value })
      setCompanyErrors((e) => ({ ...e, [field]: errs[field as keyof CompanyErrors] }))
    }
  }

  function handleCompanyBlur(field: keyof CompanyForm) {
    setTouched((t) => ({ ...t, [field]: true }))
    const errs = validateCompany(companyForm)
    setCompanyErrors((e) => ({ ...e, [field]: errs[field as keyof CompanyErrors] }))
  }

  function handleCompanySubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validateCompany(companyForm)
    setCompanyErrors(errs)
    setTouched({ name: true, nit: true, email: true })
    if (Object.keys(errs).length > 0) return

    const payload: UpsertCompanyPayload = {
      name: companyForm.name.trim(),
      nit: companyForm.nit.trim(),
      email: companyForm.email.trim() || undefined,
      phone: companyForm.phone.trim() || undefined,
      city: companyForm.city.trim() || undefined,
      address: companyForm.address.trim() || undefined,
    }
    upsert.mutate(payload)
  }

  function handleMipresSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: UpdateMipresPayload = {
      tokenCompany: mipresForm.tokenCompany.trim() || undefined,
    }
    updateMipres.mutate(payload)
  }

  function handleAiSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!aiForm.aiModel.trim()) return
    const payload: UpdateAiPayload = {
      aiApiKey: aiForm.aiApiKey.trim() || undefined,
      aiModel: aiForm.aiModel.trim(),
    }
    updateAi.mutate(payload)
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden animate-pulse">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-md bg-muted shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-3 w-16 rounded bg-muted" />
              </div>
            </div>
            <div className="h-8 w-48 rounded-lg bg-muted" />
          </div>
          <div className="px-6 py-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="h-9 w-full rounded-lg bg-muted" />
              </div>
            ))}
          </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">

        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-input shrink-0">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-foreground truncate">Empresa</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Configuración general</p>
            </div>
          </div>

          {/* Segmented control */}
          <div
            className="inline-flex items-center bg-muted rounded-lg p-1 gap-0.5 shrink-0"
            role="tablist"
            aria-label="Secciones de empresa"
          >
            {([
              { key: 'datos', label: 'Datos de la empresa' },
              { key: 'mipres', label: 'MiPres' },
              { key: 'ia', label: 'IA' },
            ] as { key: Tab; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium
                  transition-all duration-150 cursor-pointer
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
                  ${tab === key
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Not configured banner */}
        {isNotConfigured && (
          <div className="mx-6 mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 leading-snug">
              La empresa aún no ha sido configurada. Complete y guarde los datos a continuación.
            </p>
          </div>
        )}

        {/* Tab: Datos de la empresa */}
        {tab === 'datos' && (
          <form onSubmit={handleCompanySubmit} noValidate>
            <div className="divide-y divide-border">

              {/* Identificación */}
              <div className="px-6 py-5 space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Identificación</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="co-name" className="block text-xs font-medium text-foreground mb-1">
                      Nombre de la empresa <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="co-name"
                      type="text"
                      autoComplete="organization"
                      value={companyForm.name}
                      onChange={(e) => handleCompanyChange('name', e.target.value)}
                      onBlur={() => handleCompanyBlur('name')}
                      placeholder="Ej: CASMEDICAL S.A.S."
                      className={`h-9 w-full rounded-lg border px-3 text-sm bg-background
                        focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors
                        ${companyErrors.name ? 'border-destructive' : 'border-input focus:border-primary'}`}
                    />
                    {companyErrors.name && <p className="mt-1 text-xs text-destructive">{companyErrors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="co-nit" className="block text-xs font-medium text-foreground mb-1">
                      NIT <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="co-nit"
                      type="text"
                      autoComplete="off"
                      value={companyForm.nit}
                      onChange={(e) => handleCompanyChange('nit', e.target.value)}
                      onBlur={() => handleCompanyBlur('nit')}
                      placeholder="Ej: 901577372-1"
                      className={`h-9 w-full rounded-lg border px-3 text-sm bg-background
                        focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors
                        ${companyErrors.nit ? 'border-destructive' : 'border-input focus:border-primary'}`}
                    />
                    {companyErrors.nit && <p className="mt-1 text-xs text-destructive">{companyErrors.nit}</p>}
                  </div>
                </div>
              </div>

              {/* Contacto */}
              <div className="px-6 py-5 space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contacto</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="co-email" className="block text-xs font-medium text-foreground mb-1">
                      Correo electrónico
                    </label>
                    <input
                      id="co-email"
                      type="email"
                      autoComplete="email"
                      value={companyForm.email}
                      onChange={(e) => handleCompanyChange('email', e.target.value)}
                      onBlur={() => handleCompanyBlur('email')}
                      placeholder="correo@empresa.com"
                      className={`h-9 w-full rounded-lg border px-3 text-sm bg-background
                        focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors
                        ${companyErrors.email ? 'border-destructive' : 'border-input focus:border-primary'}`}
                    />
                    {companyErrors.email && <p className="mt-1 text-xs text-destructive">{companyErrors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="co-phone" className="block text-xs font-medium text-foreground mb-1">
                      Teléfono
                    </label>
                    <input
                      id="co-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      value={companyForm.phone}
                      onChange={(e) => handleCompanyChange('phone', e.target.value)}
                      placeholder="3001234567"
                      className="h-9 w-full rounded-lg border border-input px-3 text-sm bg-background
                                 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div className="px-6 py-5 space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ubicación</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="co-city" className="block text-xs font-medium text-foreground mb-1">
                      Ciudad
                    </label>
                    <input
                      id="co-city"
                      type="text"
                      value={companyForm.city}
                      onChange={(e) => handleCompanyChange('city', e.target.value)}
                      placeholder="Ej: Bogotá"
                      className="h-9 w-full rounded-lg border border-input px-3 text-sm bg-background
                                 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="co-address" className="block text-xs font-medium text-foreground mb-1">
                      Dirección
                    </label>
                    <input
                      id="co-address"
                      type="text"
                      autoComplete="street-address"
                      value={companyForm.address}
                      onChange={(e) => handleCompanyChange('address', e.target.value)}
                      placeholder="Ej: Cra 7 # 45-20"
                      className="h-9 w-full rounded-lg border border-input px-3 text-sm bg-background
                                 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end px-6 py-4 bg-muted/10">
                <button
                  type="submit"
                  disabled={upsert.isPending}
                  className="h-8 px-5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold
                             cursor-pointer hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98]
                             transition-all duration-200 shadow-sm"
                >
                  {upsert.isPending ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab: Inteligencia Artificial */}
        {tab === 'ia' && (
          <>
            {isNotConfigured ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3 text-center px-6">
                <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                <div>
                  <p className="text-sm font-medium text-foreground">Empresa no configurada</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Configure primero los datos de la empresa para acceder a esta sección
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTab('datos')}
                  className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold
                             cursor-pointer hover:bg-primary/90 transition-all duration-200 shadow-sm"
                >
                  Configurar empresa
                </button>
              </div>
            ) : (
              <form onSubmit={handleAiSubmit} noValidate>
                <div className="divide-y divide-border">
                  <div className="px-6 py-5 space-y-4">
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Proveedor de IA
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground leading-snug">
                        Credenciales para el servicio de inteligencia artificial usado en el reconocimiento de nombres de medicamentos.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="ai-api-key" className="block text-xs font-medium text-foreground mb-1">
                          API Key
                        </label>
                        <div className="relative">
                          <input
                            id="ai-api-key"
                            type={showApiKey ? 'text' : 'password'}
                            autoComplete="off"
                            value={aiForm.aiApiKey}
                            onChange={(e) => setAiForm((f) => ({ ...f, aiApiKey: e.target.value }))}
                            placeholder={company?.aiApiKey ? '••••••••••••••••••••' : 'AIza...'}
                            className="h-9 w-full rounded-lg border border-input pl-3 pr-10 text-sm bg-background font-mono
                                       focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowApiKey((v) => !v)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            aria-label={showApiKey ? 'Ocultar clave' : 'Mostrar clave'}
                          >
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {company?.aiApiKey && (
                          <p className="mt-1 text-xs text-emerald-600 font-medium">
                            ✓ Clave configurada — deje en blanco para mantenerla o ingrese una nueva para reemplazarla
                          </p>
                        )}
                        {!company?.aiApiKey && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Obtenga su API Key en Google AI Studio
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="ai-model" className="block text-xs font-medium text-foreground mb-1">
                          Modelo
                        </label>
                        <input
                          id="ai-model"
                          type="text"
                          readOnly
                          value={aiForm.aiModel}
                          className="h-9 w-full rounded-lg border border-input px-3 text-sm bg-muted/40
                                     text-muted-foreground cursor-not-allowed font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end px-6 py-4 bg-muted/10">
                    <button
                      type="submit"
                      disabled={updateAi.isPending || !aiForm.aiModel.trim()}
                      className="h-8 px-5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold
                                 cursor-pointer hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98]
                                 transition-all duration-200 shadow-sm"
                    >
                      {updateAi.isPending ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </>
        )}

        {/* Tab: MiPres */}
        {tab === 'mipres' && (
          <>
            {isNotConfigured ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3 text-center px-6">
                <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                <div>
                  <p className="text-sm font-medium text-foreground">Empresa no configurada</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Configure primero los datos de la empresa para acceder a MiPres
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTab('datos')}
                  className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold
                             cursor-pointer hover:bg-primary/90 transition-all duration-200 shadow-sm"
                >
                  Configurar empresa
                </button>
              </div>
            ) : (
              <form onSubmit={handleMipresSubmit} noValidate>
                <div className="divide-y divide-border">
                  <div className="px-6 py-5 space-y-4">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Credenciales MiPres
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground leading-snug">
                          Los campos de solo lectura son asignados por el sistema. Contacte al administrador para actualizarlos.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="mp-code" className="block text-xs font-medium text-foreground mb-1">
                          Código del prestador
                        </label>
                        <input
                          id="mp-code"
                          type="text"
                          value={company?.codeProvider ?? ''}
                          readOnly
                          className="h-9 w-full rounded-lg border border-input px-3 text-sm bg-muted/40
                                     text-muted-foreground cursor-not-allowed font-mono"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">Solo lectura — asignado por el sistema</p>
                      </div>

                      <div>
                        <label htmlFor="mp-token-company" className="block text-xs font-medium text-foreground mb-1">
                          Token de empresa
                        </label>
                        <input
                          id="mp-token-company"
                          type="text"
                          autoComplete="off"
                          value={mipresForm.tokenCompany}
                          onChange={(e) => setMipresForm({ tokenCompany: e.target.value })}
                          placeholder="Token asignado por MiPres"
                          className="h-9 w-full rounded-lg border border-input px-3 text-sm bg-background font-mono
                                     focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                        />
                      </div>

                      <div>
                        <label htmlFor="mp-token-auth" className="block text-xs font-medium text-foreground mb-1">
                          Token de autenticación
                        </label>
                        <input
                          id="mp-token-auth"
                          type="text"
                          value={company?.tokenAuth ?? ''}
                          readOnly
                          className="h-9 w-full rounded-lg border border-input px-3 text-sm bg-muted/40
                                     text-muted-foreground cursor-not-allowed font-mono"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">Solo lectura — asignado por el sistema</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between px-6 py-4 bg-muted/10">
                    <button
                      type="button"
                      onClick={() => refreshToken.mutate()}
                      disabled={refreshToken.isPending}
                      className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg border border-input
                                 bg-background text-xs font-medium text-foreground
                                 cursor-pointer hover:bg-muted/60 disabled:opacity-50 active:scale-[0.98]
                                 transition-all duration-200"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${refreshToken.isPending ? 'animate-spin' : ''}`} />
                      {refreshToken.isPending ? 'Refrescando...' : 'Refrescar token'}
                    </button>
                    <button
                      type="submit"
                      disabled={updateMipres.isPending}
                      className="h-8 px-5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold
                                 cursor-pointer hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98]
                                 transition-all duration-200 shadow-sm"
                    >
                      {updateMipres.isPending ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </>
        )}
    </div>
  )
}
