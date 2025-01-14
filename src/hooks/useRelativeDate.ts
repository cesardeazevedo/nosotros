import type { StringUnitLength } from 'luxon'
import { DateTime } from 'luxon'
import { useMemo } from 'react'

export function useRelativeDate(date: number, style: StringUnitLength = 'narrow') {
  return useMemo(() => {
    const sec = DateTime.fromSeconds(date)
    const relative = sec.toRelative({ style })
    const relativeFormatted = style === 'narrow' ? relative.replace('ago', '') : relative
    const full = sec.toLocaleString(DateTime.DATETIME_MED)
    return [relativeFormatted.includes('0 sec') ? 'just now' : relativeFormatted, full]
  }, [date])
}
