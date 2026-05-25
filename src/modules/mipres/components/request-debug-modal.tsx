import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Copy, X } from 'lucide-react'
import { toast } from 'sonner'
import type { RequestMeta } from '../../../lib/request-log'

type TabKey = 'response' | 'headers' | 'payload'

interface RequestDebugModalProps {
  title: string
  meta: RequestMeta | undefined
  onClose: () => void
}

function pretty(value: unknown): string {
  if (value == null) return ''
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function prettyMaybeJson(raw: string | null): string {
  if (raw == null || raw === '') return ''
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}

function CopyButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          toast.success('Copiado al portapapeles')
        } catch {
          toast.error('No se pudo copiar')
        }
      }}
      title="Copiar"
      className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
    >
      <Copy className="h-3 w-3" />
      Copiar
    </button>
  )
}

function HeadersTable({ headers }: { headers: Record<string, string> }) {
  const entries = Object.entries(headers)
  if (entries.length === 0) {
    return <p className="italic text-slate-400">— sin headers —</p>
  }
  return (
    <table className="w-full text-[12px]">
      <tbody className="divide-y divide-slate-100">
        {entries.map(([k, v]) => (
          <tr key={k}>
            <td className="w-1/3 py-1.5 pr-3 font-mono font-semibold text-slate-500 align-top">
              {k}
            </td>
            <td className="py-1.5 font-mono text-slate-800 break-all">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function RequestDebugModal({ title, meta, onClose }: RequestDebugModalProps) {
  const [tab, setTab] = useState<TabKey>('response')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-debug-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-xl border border-slate-200 bg-white shadow-2xl sm:max-w-3xl sm:rounded-xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3.5">
          <div>
            <h2 id="request-debug-title" className="text-base font-bold text-slate-900">
              {title}
            </h2>
            {meta ? (
              <p className="mt-0.5 font-mono text-[11.5px] text-slate-500">
                <span className="font-bold text-slate-700">{meta.method}</span>{' '}
                <span className="break-all">{meta.url}</span>{' '}
                <span
                  className={`ml-1 inline-block rounded px-1.5 py-0.5 text-[10.5px] font-bold ${
                    meta.status >= 200 && meta.status < 300
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {meta.status} {meta.statusText}
                </span>{' '}
                <span className="text-slate-400">· {meta.durationMs} ms</span>
              </p>
            ) : (
              <p className="mt-0.5 text-[11.5px] italic text-slate-400">
                Aún no se hizo ninguna petición.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <nav className="flex border-b border-slate-200 bg-white px-5 text-[12.5px] font-semibold">
          {(
            [
              { key: 'response', label: 'Respuesta' },
              { key: 'headers', label: 'Headers' },
              { key: 'payload', label: 'Payload' },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={[
                'relative -mb-px cursor-pointer px-3.5 py-2.5 transition-colors',
                tab === t.key
                  ? 'text-primary'
                  : 'text-slate-500 hover:text-slate-800',
              ].join(' ')}
            >
              {t.label}
              {tab === t.key && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto bg-slate-50 px-5 py-4">
          {!meta ? (
            <p className="text-[12.5px] italic text-slate-500">
              Aún no se hizo ninguna petición para mostrar.
            </p>
          ) : tab === 'response' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                  Response body
                </p>
                <CopyButton text={pretty(meta.responseBody)} />
              </div>
              <pre className="max-h-[60vh] overflow-auto rounded-md border border-slate-200 bg-white p-3 font-mono text-[12px] leading-relaxed text-slate-800">
                {pretty(meta.responseBody) || '— sin body —'}
              </pre>
            </div>
          ) : tab === 'headers' ? (
            <div className="space-y-5">
              <div>
                <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                  Request headers
                </p>
                <div className="rounded-md border border-slate-200 bg-white p-3">
                  <HeadersTable headers={meta.requestHeaders} />
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                  Response headers
                </p>
                <div className="rounded-md border border-slate-200 bg-white p-3">
                  <HeadersTable headers={meta.responseHeaders} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <dl className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-1.5 text-[12px]">
                <dt className="font-semibold text-slate-500">Método</dt>
                <dd className="font-mono font-bold text-slate-900">{meta.method}</dd>
                <dt className="font-semibold text-slate-500">URL</dt>
                <dd className="font-mono text-slate-800 break-all">{meta.url}</dd>
                <dt className="font-semibold text-slate-500">Iniciada</dt>
                <dd className="font-mono text-slate-700">
                  {new Date(meta.startedAt).toLocaleString('es-CO')}
                </dd>
                <dt className="font-semibold text-slate-500">Duración</dt>
                <dd className="font-mono text-slate-700">{meta.durationMs} ms</dd>
              </dl>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                    Request body
                  </p>
                  {meta.requestBody && <CopyButton text={prettyMaybeJson(meta.requestBody)} />}
                </div>
                <pre className="max-h-[40vh] overflow-auto rounded-md border border-slate-200 bg-white p-3 font-mono text-[12px] leading-relaxed text-slate-800">
                  {prettyMaybeJson(meta.requestBody) || '— sin payload —'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
