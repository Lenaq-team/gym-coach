import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return ''
  return format(new Date(date), formatStr, { locale: es })
}

export const formatDateRelative = (date) => {
  if (!date) return ''
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
}
