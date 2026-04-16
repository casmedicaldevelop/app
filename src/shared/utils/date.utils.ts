import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export const formatDate = (date: string | Date) =>
  format(typeof date === 'string' ? parseISO(date) : date, 'dd/MM/yyyy', { locale: es })

export const formatRelative = (date: string | Date) =>
  formatDistanceToNow(typeof date === 'string' ? parseISO(date) : date, { locale: es, addSuffix: true })
