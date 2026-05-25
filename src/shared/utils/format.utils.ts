export function formatCurrency(value: number): string {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

export function formatDateTime(str: string): string {
  return new Date(str).toLocaleString('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
