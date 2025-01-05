import { DateTime } from 'luxon'
import { useMemo } from 'react'

export function useRelativeDate(date: number) {
  return useMemo(() => {
    const sec = DateTime.fromSeconds(date)
    const relative = sec.toRelative({ style: 'narrow' })?.replace('ago', '')
    const full = sec.toLocaleString(DateTime.DATETIME_MED)
    return [relative === 'in 0 sec' ? 'just now' : relative, full]
  }, [date])
}
