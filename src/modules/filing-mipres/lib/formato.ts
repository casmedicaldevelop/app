import type { Company } from '../../company/types/company.types'
import type { DeliveryItem, FilingDetail } from '../types/filing-mipres.types'

export interface FormatoData {
  company: Company | null | undefined
  filing: FilingDetail
  delivery: DeliveryItem
}

export interface FormatoFields {
  companyName: string
  companyLine: string
  companyAddress: string
  code: string
  userName: string
  userDoc: string
  phone: string
  entregaNumber: string
  prescription: string
  cum: string
  description: string
  quantity: number
  receivedDate: string
}

function userFullName(filing: FilingDetail): string {
  const p = filing.patient
  if (!p) return filing.userDocument
  const name = [p.firstName, p.secondName, p.firstSurname, p.secondSurname].filter(Boolean).join(' ')
  return name || filing.userDocument
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** RM-{idRadicado}-{P|C}{n° entrega}. P = Parcial, C = Completa. */
export function deliveryCode(filing: FilingDetail, delivery: DeliveryItem): string {
  const kind = delivery.deliveryType === 'COMPLETA' ? 'C' : 'P'
  return `RM-${filing.id}-${kind}${delivery.deliveryNumber}`
}

export function buildFormatoFields(data: FormatoData): FormatoFields {
  const { company, filing, delivery } = data
  const p = filing.patient
  const companyParts = [
    company?.nit ? `NIT ${company.nit}` : null,
    company?.phone ? `Tel. ${company.phone}` : null,
  ].filter(Boolean)
  return {
    companyName: (company?.name ?? 'CASMEDICAL').toUpperCase(),
    companyLine: companyParts.join(' · '),
    companyAddress: company?.address ?? '',
    code: deliveryCode(filing, delivery),
    userName: userFullName(filing),
    userDoc: p ? `${p.documentType ?? ''} ${p.document}`.trim() : filing.userDocument,
    phone: p?.phone ?? '—',
    entregaNumber: String(delivery.deliveryNumber),
    prescription: filing.prescriptionNumber,
    cum: filing.inventoryCode ?? filing.tvData?.inventoryCode ?? '—',
    description: `${filing.technologyCode} - ${filing.medicationName}`,
    quantity: delivery.quantityPendingAfter === 0 ? filing.quantityToDeliver : delivery.quantityDelivered,
    receivedDate: fmtDate(delivery.createdAt),
  }
}

function buildFormatoHtml(f: FormatoFields, logoUrl: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  return `<!DOCTYPE html>
<html lang="es"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Formato de entrega · ${esc(f.code)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root{--navy:#0E2E5A;--blue:#1E78C8;--gold:#C8973F;--ink:#13203A;--muted:#5A6B82;--line:#E2E8F0;--accent:var(--navy);--ff:'Plus Jakarta Sans',sans-serif;--fh:'Plus Jakarta Sans',sans-serif;}
  *{box-sizing:border-box;}html,body{margin:0;}
  body{background:#525659;font-family:var(--ff);color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .toolbar{position:sticky;top:0;display:flex;justify-content:center;padding:10px;background:#3a3d40;}
  .toolbar button{font:600 13px var(--ff);padding:8px 16px;border:0;border-radius:6px;background:var(--gold);color:#1a1a1a;cursor:pointer;}
  .sheet{width:216mm;min-height:279mm;margin:16px auto;background:#fff;position:relative;overflow:hidden;box-shadow:0 6px 28px rgba(0,0,0,.35);padding:13mm 16mm 0;}
  .head{display:flex;justify-content:space-between;align-items:center;gap:8mm;padding-bottom:6mm;border-bottom:3px solid var(--accent);}
  .brand{display:flex;align-items:center;gap:6mm;}.brand img{height:33mm;width:auto;}
  .brand .ttl{font:800 21pt var(--fh);color:var(--navy);line-height:1;letter-spacing:.2px;}
  .code{text-align:right;}.code .lbl{font-size:7.5pt;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);}
  .code .c{font:800 18pt var(--fh);color:var(--gold);letter-spacing:1px;line-height:1.1;white-space:nowrap;}
  .code .v{font-size:8.5pt;color:var(--navy);font-weight:600;}
  .company{font-size:9pt;color:var(--muted);padding:3.5mm 0;border-bottom:1px solid var(--line);margin-bottom:8mm;text-align:center;}.company b{color:var(--ink);}
  .info{display:grid;grid-template-columns:1fr 1fr;gap:10mm;margin-bottom:8mm;}
  .col .lbl{font:700 8pt var(--ff);letter-spacing:1.5px;text-transform:uppercase;color:var(--accent);border-bottom:1px solid var(--line);padding-bottom:1.5mm;margin-bottom:2.5mm;}
  .row{display:grid;grid-template-columns:25mm 1fr;font-size:10.5pt;padding:1.7mm 0;align-items:baseline;}
  .row .k{color:var(--muted);font-size:9pt;}.row .v{font-weight:600;}.row .v.lg{font-size:12pt;font-weight:700;}
  .sec{font:700 8.5pt var(--ff);letter-spacing:1.5px;text-transform:uppercase;color:var(--navy);margin:0 0 3mm;}
  table{width:100%;border-collapse:collapse;font-size:10.5pt;border:1px solid var(--navy);margin-bottom:9mm;}
  thead th{background:var(--navy);color:#fff;font:600 8.5pt var(--ff);letter-spacing:.6px;text-transform:uppercase;text-align:left;padding:3.4mm 5mm;}thead th.r{text-align:right;}
  tbody td{padding:5mm;border-right:1px solid var(--line);}tbody td:last-child{border-right:0;}
  tbody td.cum{font-weight:700;color:var(--blue);white-space:nowrap;}tbody td.qty{text-align:right;font:800 18pt var(--fh);color:var(--navy);}
  .decl{font-size:9.5pt;line-height:1.55;color:#33415C;border-left:3px solid var(--gold);padding-left:5mm;margin-bottom:11mm;}.decl b{color:var(--navy);}
  .sign-row{display:grid;grid-template-columns:1.1fr 1fr;gap:14mm;align-items:end;}
  .sign-line{border-top:1.5px solid var(--ink);padding-top:2.5mm;font-size:9pt;color:var(--muted);}
  .constancia{display:flex;flex-direction:column;align-items:center;gap:3mm;}
  .stamp{transform:rotate(-7deg);border:3px double var(--gold);color:var(--gold);border-radius:3mm;padding:3.5mm 8mm;text-align:center;opacity:.9;}
  .stamp .big{font:800 15pt var(--fh);letter-spacing:3px;line-height:1;}.stamp .sm{font-size:7.5pt;letter-spacing:1.5px;margin-top:1mm;}
  .recv-date{font-size:9pt;color:var(--muted);}.recv-date b{color:var(--navy);}
  .foot{position:absolute;left:16mm;right:16mm;bottom:8mm;border-top:1px solid var(--line);padding-top:2.5mm;font-size:8pt;color:var(--muted);display:flex;justify-content:space-between;}.foot b{color:var(--navy);}
  @media print{body{background:#fff;}.toolbar{display:none;}.sheet{margin:0;box-shadow:none;}@page{size:letter;margin:0;}}
</style></head>
<body>
<div class="toolbar"><button onclick="window.print()">Imprimir / Guardar PDF</button></div>
<div class="sheet">
  <div class="head">
    <div class="brand"><img src="${esc(logoUrl)}" alt="CASMEDICAL" /><div class="ttl">FORMATO DE ENTREGA</div></div>
    <div class="code"><div class="c">${esc(f.code)}</div><div class="v">Versión 02</div></div>
  </div>
  <div class="company">${esc(f.companyLine)}</div>
  <div class="info">
    <div class="col"><div class="lbl">Usuario</div>
      <div class="row"><span class="k">Nombre</span><span class="v">${esc(f.userName)}</span></div>
      <div class="row"><span class="k">Cédula</span><span class="v lg">${esc(f.userDoc)}</span></div>
      <div class="row"><span class="k">Teléfono</span><span class="v">${esc(f.phone)}</span></div></div>
    <div class="col"><div class="lbl">Entrega</div>
      <div class="row"><span class="k"># Entrega</span><span class="v">${esc(f.entregaNumber)}</span></div>
      <div class="row"><span class="k">Fecha</span><span class="v">${esc(f.receivedDate)}</span></div>
      <div class="row"><span class="k">Prescripción</span><span class="v">${esc(f.prescription)}</span></div></div>
  </div>
  <h2 class="sec">Medicamento entregado</h2>
  <table>
    <thead><tr><th style="width:34mm">CUM</th><th>Descripción</th><th class="r" style="width:24mm">Cant.</th></tr></thead>
    <tbody><tr><td class="cum">${esc(f.cum)}</td><td>${esc(f.description)}</td><td class="qty">${f.quantity}</td></tr></tbody>
  </table>
  <div class="decl"><b>Declaración de recibido.</b> Declaro haber recibido el medicamento en condiciones adecuadas, con su
    respectivo empaque y rotulado, dejando constancia de la entrega a satisfacción, así como de haber recibido las
    indicaciones correspondientes para su correcta conservación, aplicación y uso.</div>
  <div class="sign-row">
    <div><div style="height:14mm"></div><div class="sign-line">Firma y cédula</div></div>
    <div class="constancia"><div class="stamp"><div class="big">ENTREGADO</div><div class="sm">CASMEDICAL</div></div></div>
  </div>
  <div class="foot"><span><b>${esc(f.companyName)}</b></span><span>${esc(f.companyAddress)}</span></div>
</div>
</body></html>`
}

/** Genera el Formato de Entrega (tamaño carta) con los datos reales de la entrega y lo abre en una pestaña nueva. */
export function openFormatoWindow(data: FormatoData): void {
  const logoUrl = `${window.location.origin}/logo-casmedical.png`
  const html = buildFormatoHtml(buildFormatoFields(data), logoUrl)
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(html)
  w.document.close()
}
