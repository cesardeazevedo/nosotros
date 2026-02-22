import { useMemo } from 'react'
import { formatFullDate, formatRelativeDate, type RelativeDateStyle } from '@/utils/dateUtils'

export function useRelativeDate(date: number, style: RelativeDateStyle = 'narrow') {
  return useMemo(() => [formatRelativeDate(date, style), formatFullDate(date)] as const, [date, style])
}
