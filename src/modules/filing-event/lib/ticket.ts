import JsBarcode from 'jsbarcode'
import { jsPDF } from 'jspdf'
import type { Company } from '../../company/types/company.types'
import type { DeliveryEventItem, FilingEventDetail, FilingEventItem } from '../services/filing-event.service'

export interface TicketData {
  company: Company | null | undefined
  filing: FilingEventDetail
  item: FilingEventItem
  delivery: DeliveryEventItem
  shelfCode: string
}

// 58mm de ancho útil. El PDF usa una página continua estrecha; el HTML usa @page size:58mm auto.
const PAGE_W = 58
const MARGIN = 4
const CONTENT_W = PAGE_W - MARGIN * 2

function userFullName(filing: FilingEventDetail): string {
  const u = filing.user
  if (!u) return filing.userDocument
  return [u.firstName, u.secondName, u.firstSurname, u.secondSurname].filter(Boolean).join(' ')
}

function userDoc(filing: FilingEventDetail): string {
  const t = filing.user?.documentType ?? 'CC'
  return `${t} ${filing.userDocument}`
}

/** Code128 del valor (id del radicado) renderizado a PNG dataURL — vector nítido para 203 dpi. */
function barcodeDataUrl(value: string): string {
  const canvas = document.createElement('canvas')
  // Solo las barras (sin el número): el número va como texto real debajo, así no se pixela
  // al escalar. width alto = más resolución de barras para impresión térmica nítida.
  JsBarcode(canvas, value, {
    format: 'CODE128',
    lineColor: '#000000',
    background: '#ffffff',
    width: 3,
    height: 70,
    displayValue: false,
    margin: 0,
  })
  return canvas.toDataURL('image/png')
}

interface TicketFields {
  companyName: string
  companyNit: string
  userName: string
  userDocument: string
  medication: string
  total: number
  delivered: number
  pending: number
  barcodeValue: string
  shelfCode: string
}

function fields(data: TicketData): TicketFields {
  return {
    companyName: data.company?.name ?? 'CASMEDICAL',
    companyNit: data.company?.nit ?? '',
    userName: userFullName(data.filing),
    userDocument: userDoc(data.filing),
    medication: data.item.name,
    total: data.item.quantity,
    delivered: data.delivery.quantityDelivered,
    pending: data.delivery.quantityPendingAfter,
    barcodeValue: data.filing.authorizationCode,
    shelfCode: data.shelfCode,
  }
}

/** PDF de ancho 58mm con el ticket (monoespaciado + código de barras). */
function buildTicketPdf(f: TicketFields, barcodeUrl: string): jsPDF {
  const lineH = 4.2
  // Altura aproximada del contenido (líneas + estantería + barcode + número + separadores) en mm.
  const pageH = 120
  const doc = new jsPDF({ unit: 'mm', format: [PAGE_W, pageH] })
  doc.setFont('courier', 'normal')

  const cx = PAGE_W / 2
  let y = 7

  doc.setFont('courier', 'bold')
  doc.setFontSize(10)
  doc.text(f.companyName.toUpperCase(), cx, y, { align: 'center' })
  y += lineH
  if (f.companyNit) {
    doc.setFont('courier', 'normal')
    doc.setFontSize(8)
    doc.text(`NIT ${f.companyNit}`, cx, y, { align: 'center' })
    y += lineH
  }
  y += 1
  doc.setLineWidth(0.2)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += lineH

  doc.setFontSize(7)
  doc.text('USUARIO', MARGIN, y)
  y += lineH
  doc.setFont('courier', 'bold')
  doc.setFontSize(9)
  doc.text(doc.splitTextToSize(f.userName, CONTENT_W) as string[], MARGIN, y)
  y += lineH * (doc.splitTextToSize(f.userName, CONTENT_W) as string[]).length
  doc.setFont('courier', 'normal')
  doc.setFontSize(8)
  doc.text(f.userDocument, MARGIN, y)
  y += lineH + 1
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += lineH

  doc.setFontSize(7)
  doc.text('MEDICAMENTO', MARGIN, y)
  y += lineH
  doc.setFont('courier', 'bold')
  doc.setFontSize(9)
  const medLines = doc.splitTextToSize(f.medication, CONTENT_W) as string[]
  doc.text(medLines, MARGIN, y)
  y += lineH * medLines.length + 1
  doc.setFont('courier', 'normal')
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += lineH

  doc.setFontSize(9)
  const row = (label: string, value: string) => {
    doc.text(label, MARGIN, y)
    doc.text(value, PAGE_W - MARGIN, y, { align: 'right' })
    y += lineH
  }
  doc.setFont('courier', 'bold')
  row('TOTAL', String(f.total))
  row('ENTREGADO', String(f.delivered))
  row('FALTANTE', String(f.pending))
  doc.setFont('courier', 'normal')
  y += 1
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += 4

  // Código de estantería: centrado, grande y en negrita.
  doc.setFont('courier', 'normal')
  doc.setFontSize(7)
  doc.text('ESTANTERÍA', cx, y, { align: 'center' })
  y += 8
  doc.setFont('courier', 'bold')
  doc.setFontSize(30)
  doc.text(f.shelfCode, cx, y, { align: 'center' })
  y += 6
  doc.setFont('courier', 'normal')
  doc.setFontSize(9)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += 3

  // Código de barras centrado + número como texto (nítido, no rasterizado).
  const bw = CONTENT_W
  const bh = 16
  doc.addImage(barcodeUrl, 'PNG', MARGIN, y, bw, bh)
  y += bh + 4
  doc.setFont('courier', 'bold')
  doc.setFontSize(11)
  doc.text(f.barcodeValue, PAGE_W / 2, y, { align: 'center' })

  return doc
}

function buildTicketHtml(f: TicketFields, barcodeUrl: string, pdfDataUri: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8" />
<title>Ticket de entrega</title>
<style>
  @page { margin: 0; }
  html,body{ margin:0; background:#e5e7eb; font-family:'Courier New',monospace; }
  .bar{ display:flex; gap:8px; padding:10px; justify-content:center; }
  .bar button,.bar a{ font:inherit; font-size:13px; padding:8px 14px; border:1px solid #111; background:#fff; color:#111; text-decoration:none; cursor:pointer; border-radius:6px; }
  .roll{ width:58mm; margin:0 auto 24px; background:#fff; color:#000; padding:2mm; box-sizing:border-box; }
  .c{ text-align:center; } .b{ font-weight:bold; }
  .hr{ border:0; border-top:1px dashed #000; margin:2mm 0; }
  .hr2{ border:0; border-top:1px solid #000; margin:2mm 0; }
  .sm{ font-size:9pt; line-height:1.25; } .md{ font-size:10pt; line-height:1.3; }
  .label{ font-size:8pt; letter-spacing:.5px; }
  .qty{ display:flex; justify-content:space-between; font-size:11pt; font-weight:bold; }
  .shelf-label{ text-align:center; font-size:8pt; letter-spacing:1px; margin-top:1mm; }
  .shelf{ text-align:center; font-weight:bold; font-size:30pt; line-height:1; margin:1mm 0 2mm; }
  img.barcode{ width:100%; height:auto; display:block; margin-top:2mm; }
  @media print { .bar{ display:none; } html,body{ background:#fff; } .roll{ margin:0; } }
</style></head>
<body>
  <div class="bar">
    <button onclick="window.print()">Imprimir</button>
    <a href="${pdfDataUri}" download="ticket-entrega.pdf">Descargar PDF</a>
  </div>
  <div class="roll">
    <div class="c b md">${esc(f.companyName.toUpperCase())}</div>
    ${f.companyNit ? `<div class="c sm">NIT ${esc(f.companyNit)}</div>` : ''}
    <hr class="hr" />
    <div class="label">USUARIO</div>
    <div class="b md">${esc(f.userName)}</div>
    <div class="sm">${esc(f.userDocument)}</div>
    <hr class="hr" />
    <div class="label">MEDICAMENTO</div>
    <div class="b md">${esc(f.medication)}</div>
    <hr class="hr" />
    <div class="qty"><span>TOTAL</span><span>${f.total}</span></div>
    <div class="qty"><span>ENTREGADO</span><span>${f.delivered}</span></div>
    <div class="qty"><span>FALTANTE</span><span>${f.pending}</span></div>
    <hr class="hr" />
    <div class="shelf-label">ESTANTERÍA</div>
    <div class="shelf">${esc(f.shelfCode)}</div>
    <hr class="hr2" />
    <img class="barcode" src="${barcodeUrl}" alt="codigo de barras" />
    <div class="c b" style="font-size:11pt;letter-spacing:3px;margin-top:1mm">${esc(f.barcodeValue)}</div>
  </div>
  <script>
    window.onload=function(){
      // Fija el tamaño de pagina exacto: 58mm de ancho x el alto real del ticket (rollo continuo).
      var roll=document.querySelector('.roll');
      var hmm=Math.ceil(roll.getBoundingClientRect().height*25.4/96)+2;
      var st=document.createElement('style');
      st.appendChild(document.createTextNode('@page{size:58mm '+hmm+'mm;margin:0}'));
      document.head.appendChild(st);
      setTimeout(function(){window.print()},300);
    };
  </script>
</body></html>`
}

/** Construye el ticket (barcode + PDF + HTML) y lo escribe en una ventana ya abierta. */
export function renderTicket(w: Window, data: TicketData): void {
  const f = fields(data)
  const barcodeUrl = barcodeDataUrl(f.barcodeValue)
  const pdfDataUri = buildTicketPdf(f, barcodeUrl).output('datauristring')
  const html = buildTicketHtml(f, barcodeUrl, pdfDataUri)
  w.document.open()
  w.document.write(html)
  w.document.close()
}

/** Genera el ticket y lo abre en una pestaña nueva, autocontenida. */
export function openTicketWindow(data: TicketData): void {
  const w = window.open('', '_blank')
  if (!w) return
  renderTicket(w, data)
}

// ── Ticket de PENDIENTE de TODO el proceso (varias líneas, nombre reducido) ────────────────

export interface PendingTicketLine {
  name: string // nombre reducido (shortName, el del resumen)
  pending: number
}

export interface PendingTicketData {
  company: Company | null | undefined
  filing: FilingEventDetail
  shelfCode: string
  lines: PendingTicketLine[]
  invoiceDate: string // fecha del ticket (YYYY-MM-DD), ingresada por el usuario para este lote
}

interface PendingTicketFields {
  companyName: string
  companyNit: string
  userName: string
  userDocument: string
  lines: PendingTicketLine[]
  barcodeValue: string
  shelfCode: string
  invoiceDate: string
}

function pendingFields(data: PendingTicketData): PendingTicketFields {
  const [y, m, d] = data.invoiceDate.split('-')
  return {
    companyName: data.company?.name ?? 'CASMEDICAL',
    companyNit: data.company?.nit ?? '',
    userName: userFullName(data.filing),
    userDocument: userDoc(data.filing),
    lines: data.lines,
    barcodeValue: data.filing.authorizationCode,
    shelfCode: data.shelfCode,
    invoiceDate: y && m && d ? `${d}/${m}/${y}` : data.invoiceDate,
  }
}

function buildPendingTicketPdf(f: PendingTicketFields, barcodeUrl: string): jsPDF {
  const lineH = 4.2
  // Alto dinámico según cuántas líneas pendientes haya.
  const pageH = 95 + f.lines.length * (lineH * 2 + 1)
  const doc = new jsPDF({ unit: 'mm', format: [PAGE_W, pageH] })
  doc.setFont('courier', 'normal')

  const cx = PAGE_W / 2
  let y = 7

  doc.setFont('courier', 'bold')
  doc.setFontSize(10)
  doc.text(f.companyName.toUpperCase(), cx, y, { align: 'center' })
  y += lineH
  if (f.companyNit) {
    doc.setFont('courier', 'normal')
    doc.setFontSize(8)
    doc.text(`NIT ${f.companyNit}`, cx, y, { align: 'center' })
    y += lineH
  }
  y += 1
  doc.setFont('courier', 'bold')
  doc.setFontSize(9)
  doc.text('FORMATO DE PENDIENTE', cx, y, { align: 'center' })
  y += lineH
  doc.setFont('courier', 'normal')
  doc.setFontSize(8)
  doc.text('CSM FT-21', cx, y, { align: 'center' })
  y += lineH
  doc.text('VERSION: 02', cx, y, { align: 'center' })
  y += lineH
  doc.setLineWidth(0.2)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += lineH

  doc.setFontSize(7)
  doc.text('USUARIO', MARGIN, y)
  y += lineH
  doc.setFont('courier', 'bold')
  doc.setFontSize(9)
  const nameLines = doc.splitTextToSize(f.userName, CONTENT_W) as string[]
  doc.text(nameLines, MARGIN, y)
  y += lineH * nameLines.length
  doc.setFont('courier', 'normal')
  doc.setFontSize(8)
  doc.text(f.userDocument, MARGIN, y)
  y += lineH
  doc.setFontSize(7)
  doc.text('FECHA', MARGIN, y)
  doc.setFontSize(8)
  doc.text(f.invoiceDate, PAGE_W - MARGIN, y, { align: 'right' })
  y += lineH + 1
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += lineH

  // Lista de medicamentos pendientes: nombre reducido + cantidad pendiente.
  doc.setFontSize(8)
  for (const l of f.lines) {
    const medLines = doc.splitTextToSize(l.name, CONTENT_W) as string[]
    doc.setFont('courier', 'bold')
    doc.text(medLines, MARGIN, y)
    y += lineH * medLines.length
    doc.setFont('courier', 'normal')
    doc.text('PENDIENTE', MARGIN, y)
    doc.text(String(l.pending), PAGE_W - MARGIN, y, { align: 'right' })
    y += lineH + 1
  }
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += 4

  doc.setFont('courier', 'normal')
  doc.setFontSize(7)
  doc.text('ESTANTERÍA', cx, y, { align: 'center' })
  y += 8
  doc.setFont('courier', 'bold')
  doc.setFontSize(30)
  doc.text(f.shelfCode, cx, y, { align: 'center' })
  y += 6
  doc.setFont('courier', 'normal')
  doc.setFontSize(9)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += 3

  const bw = CONTENT_W
  const bh = 16
  doc.addImage(barcodeUrl, 'PNG', MARGIN, y, bw, bh)
  y += bh + 4
  doc.setFont('courier', 'bold')
  doc.setFontSize(11)
  doc.text(f.barcodeValue, cx, y, { align: 'center' })

  return doc
}

function buildPendingTicketHtml(f: PendingTicketFields, barcodeUrl: string, pdfDataUri: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const rows = f.lines
    .map(
      (l) =>
        `<div class="b md">${esc(l.name)}</div><div class="qty"><span>PENDIENTE</span><span>${l.pending}</span></div>`,
    )
    .join('<hr class="hr" />')
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8" />
<title>Formato de pendiente</title>
<style>
  @page { margin: 0; }
  html,body{ margin:0; background:#e5e7eb; font-family:'Courier New',monospace; }
  .bar{ display:flex; gap:8px; padding:10px; justify-content:center; }
  .bar button,.bar a{ font:inherit; font-size:13px; padding:8px 14px; border:1px solid #111; background:#fff; color:#111; text-decoration:none; cursor:pointer; border-radius:6px; }
  .roll{ width:58mm; margin:0 auto 24px; background:#fff; color:#000; padding:2mm; box-sizing:border-box; }
  .c{ text-align:center; } .b{ font-weight:bold; }
  .hr{ border:0; border-top:1px dashed #000; margin:2mm 0; }
  .hr2{ border:0; border-top:1px solid #000; margin:2mm 0; }
  .sm{ font-size:9pt; line-height:1.25; } .md{ font-size:10pt; line-height:1.3; }
  .label{ font-size:8pt; letter-spacing:.5px; }
  .qty{ display:flex; justify-content:space-between; font-size:11pt; font-weight:bold; }
  .shelf-label{ text-align:center; font-size:8pt; letter-spacing:1px; margin-top:1mm; }
  .shelf{ text-align:center; font-weight:bold; font-size:30pt; line-height:1; margin:1mm 0 2mm; }
  img.barcode{ width:100%; height:auto; display:block; margin-top:2mm; }
  @media print { .bar{ display:none; } html,body{ background:#fff; } .roll{ margin:0; } }
</style></head>
<body>
  <div class="bar">
    <button onclick="window.print()">Imprimir</button>
    <a href="${pdfDataUri}" download="ticket-pendiente.pdf">Descargar PDF</a>
  </div>
  <div class="roll">
    <div class="c b md">${esc(f.companyName.toUpperCase())}</div>
    ${f.companyNit ? `<div class="c sm">NIT ${esc(f.companyNit)}</div>` : ''}
    <div class="c b md">FORMATO DE PENDIENTE</div>
    <div class="c sm">CSM FT-21</div>
    <div class="c sm">VERSION: 02</div>
    <hr class="hr" />
    <div class="label">USUARIO</div>
    <div class="b md">${esc(f.userName)}</div>
    <div class="sm">${esc(f.userDocument)}</div>
    <div class="qty" style="font-size:9pt"><span>FECHA</span><span>${esc(f.invoiceDate)}</span></div>
    <hr class="hr" />
    ${rows}
    <hr class="hr" />
    <div class="shelf-label">ESTANTERÍA</div>
    <div class="shelf">${esc(f.shelfCode)}</div>
    <hr class="hr2" />
    <img class="barcode" src="${barcodeUrl}" alt="codigo de barras" />
    <div class="c b" style="font-size:11pt;letter-spacing:3px;margin-top:1mm">${esc(f.barcodeValue)}</div>
  </div>
  <script>
    window.onload=function(){
      var roll=document.querySelector('.roll');
      var hmm=Math.ceil(roll.getBoundingClientRect().height*25.4/96)+2;
      var st=document.createElement('style');
      st.appendChild(document.createTextNode('@page{size:58mm '+hmm+'mm;margin:0}'));
      document.head.appendChild(st);
      setTimeout(function(){window.print()},300);
    };
  </script>
</body></html>`
}

/** Construye el ticket de pendiente (varias líneas) y lo escribe en una ventana ya abierta. */
export function renderPendingTicket(w: Window, data: PendingTicketData): void {
  const f = pendingFields(data)
  const barcodeUrl = barcodeDataUrl(f.barcodeValue)
  const pdfDataUri = buildPendingTicketPdf(f, barcodeUrl).output('datauristring')
  const html = buildPendingTicketHtml(f, barcodeUrl, pdfDataUri)
  w.document.open()
  w.document.write(html)
  w.document.close()
}
