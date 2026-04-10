export type RelativeDateStyle = Intl.RelativeTimeFormatStyle
type RelativeUnit = Intl.RelativeTimeFormatUnit

const SECOND = 1
const MINUTE = 60 * SECOND
const MINUTE_MS = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY
const YEAR = 365 * DAY

const pickRelativeUnit = (absSeconds: number): { unit: RelativeUnit; value: number } => {
  if (absSeconds < MINUTE) return { unit: 'second', value: absSeconds }
  if (absSeconds < HOUR) return { unit: 'minute', value: absSeconds / MINUTE }
  if (absSeconds < DAY) return { unit: 'hour', value: absSeconds / HOUR }
  if (absSeconds < WEEK) return { unit: 'day', value: absSeconds / DAY }
  if (absSeconds < MONTH) return { unit: 'week', value: absSeconds / WEEK }
  if (absSeconds < YEAR) return { unit: 'month', value: absSeconds / MONTH }
  return { unit: 'year', value: absSeconds / YEAR }
}

export const formatRelativeDate = (date: number, style: RelativeDateStyle = 'narrow') => {
  const dateMs = date * 1000
  const deltaSeconds = Math.round((dateMs - Date.now()) / 1000)
  const absSeconds = Math.abs(deltaSeconds)
  const { unit, value } = pickRelativeUnit(absSeconds)
  const signedValue = deltaSeconds < 0 ? -Math.round(value) : Math.round(value)
  const relativeStyle = style === 'narrow' ? 'short' : style
  const relative = new Intl.RelativeTimeFormat(undefined, { style: relativeStyle }).format(signedValue, unit)
  const relativeFormatted = style === 'narrow' ? relative.replace('ago', '') : relative

  return relativeFormatted.includes('0 sec') ? 'just now' : relativeFormatted
}

export const formatFullDate = (date: number) => {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date * 1000)
}

type RelativeDuration = {
  days?: number
  hours?: number
  minutes?: number
  seconds?: number
}

const durationToMs = (duration: RelativeDuration) => {
  const days = (duration.days || 0) * 24 * 60 * MINUTE_MS
  const hours = (duration.hours || 0) * 60 * MINUTE_MS
  const minutes = (duration.minutes || 0) * MINUTE_MS
  const seconds = (duration.seconds || 0) * 1000
  return days + hours + minutes + seconds
}

export const toUnix = (ms: number) => Math.floor(ms / 1000)

export const nowUnix = () => toUnix(Date.now())

export const nowMinusUnix = (duration: RelativeDuration) => {
  return toUnix(Date.now() - durationToMs(duration))
}
