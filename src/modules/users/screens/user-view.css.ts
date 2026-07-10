// Shared visual line of the users module form screens (.uv): white topbar with
// back button + title + actions, #f5f6fa content, 4-column field grid, inline
// editing styles. Used by service-user-detail and service-user-create.
export const UV_CSS = `
.uv { display:flex; flex-direction:column; height:100%; min-height:100%; width:100%; background:#f5f6fa; color:#2d3436; font-family:'Inter Variable', system-ui, sans-serif; font-size:14px; line-height:1.5; }
.uv .topbar { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:12px 28px; background:#fff; border-bottom:1px solid #dfe6e9; position:sticky; top:0; z-index:10; }
.uv .topbar-left { display:flex; align-items:center; gap:16px; }
.uv .btn-back { display:inline-flex; align-items:center; gap:6px; font-size:14px; font-weight:500; color:#636e72; background:none; border:1px solid #dfe6e9; border-radius:6px; padding:6px 12px; cursor:pointer; transition:background 200ms,color 200ms; }
.uv .btn-back:hover { background:#f0f0f0; color:#2d3436; }
.uv .page-title { font-family:'Plus Jakarta Sans Variable', sans-serif; font-size:18px; font-weight:700; color:#2d3436; }
.uv .actions { display:flex; align-items:center; gap:8px; }
.uv .btn-edit { display:inline-flex; align-items:center; gap:7px; font-size:14px; font-weight:600; color:#fff; background:#2d3436; border:none; border-radius:6px; padding:8px 18px; cursor:pointer; transition:opacity 200ms; }
.uv .btn-edit:hover { opacity:.85; }
.uv .btn-edit:disabled { opacity:.5; cursor:default; }
.uv .btn-cancel { display:inline-flex; align-items:center; gap:6px; font-size:14px; font-weight:500; color:#2d3436; background:none; border:1px solid #dfe6e9; border-radius:6px; padding:7px 14px; cursor:pointer; transition:background 200ms; }
.uv .btn-cancel:hover { background:#f0f0f0; }
.uv .btn-cancel:disabled { opacity:.5; cursor:default; }
.uv .content { flex:1; padding:0; overflow:auto; }
.uv .files-wrap { flex:1; min-height:0; display:flex; flex-direction:column; }
.uv .mipres { font-family:'Inter Variable', system-ui, sans-serif; overflow-x:auto; margin-bottom:28px; }
.uv .mipres-empty { padding:22px 0; text-align:center; color:#9ca3af; font-size:14px; }
.uv .section-title { width:100%; font-size:14px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:#636e72; padding:0 28px 6px; margin-bottom:12px; border-bottom:1px solid #dfe6e9; }
.uv .field-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0; margin-bottom:28px; border-bottom:1px solid #dfe6e9; background:#fff; }
.uv .field { display:flex; flex-direction:column; gap:3px; padding:12px 16px; border-right:1px solid #dfe6e9; border-bottom:1px solid #dfe6e9; min-width:0; }
.uv .field:nth-child(4n) { border-right:none; }
.uv .field:last-child { border-bottom:none; }
.uv .field-span { grid-column:1 / -1; border-right:none; }
.uv .field-label { font-size:14px; font-weight:500; letter-spacing:.04em; text-transform:uppercase; color:#636e72; }
.uv .req { color:#ee5253; margin-left:2px; }
.uv .field-input { width:100%; border:none; background:transparent; font-family:inherit; font-size:14px; font-weight:500; color:#2d3436; padding:0; outline:none; line-height:1.5; min-width:0; }
.uv .field-input:disabled { color:#2d3436; -webkit-text-fill-color:#2d3436; opacity:1; cursor:default; }
.uv select.field-input { appearance:none; }
.uv.editing .field-input:enabled { border:1px solid #b2bec3; border-radius:6px; padding:6px 9px; background:#fff; }
.uv.editing select.field-input:enabled { cursor:pointer; }
.uv.editing .field-input:enabled:focus { border-color:#2d3436; box-shadow:0 0 0 3px rgba(45,52,54,.12); }
.uv .field-full { display:flex; flex-direction:column; gap:3px; padding:12px 16px; background:#fff; border:1px solid #dfe6e9; border-radius:8px; margin-bottom:28px; }
.uv textarea.field-input { resize:vertical; min-height:64px; font-family:inherit; }
.uv.editing .topbar .status-select { width:auto; min-width:150px; }
.uv .badge { display:inline-flex; align-items:center; gap:5px; padding:2px 10px; border-radius:20px; font-size:14px; font-weight:600; width:fit-content; }
.uv .badge-active { background:#d8f3dc; color:#1b4332; }
.uv .badge-inactive { background:#f1f3f4; color:#636e72; }
.uv .badge-dot { width:6px; height:6px; border-radius:50%; background:currentColor; }
.uv .err { color:#ee5253; font-size:14px; margin-top:2px; }
.uv .birth-row { display:flex; align-items:center; gap:6px; }
.uv .birth-row .field-input { flex:1; }
.uv .birth-toggle { flex-shrink:0; display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; border:1px solid #b2bec3; border-radius:6px; background:#fff; color:#636e72; cursor:pointer; }
.uv .birth-toggle:hover { border-color:#2d3436; color:#2d3436; }
@media (max-width:1024px){
  .uv .field-grid { grid-template-columns:repeat(2,1fr); }
  .uv .field:nth-child(4n) { border-right:1px solid #dfe6e9; }
  .uv .field:nth-child(2n) { border-right:none; }
  .uv .field:nth-last-child(-n+2):nth-child(odd),
  .uv .field:nth-last-child(-n+2):nth-child(even) { border-bottom:none; }
}
@media (max-width:640px){
  .uv .content { padding:0; }
  .uv .topbar { padding:10px 16px; }
}
`
