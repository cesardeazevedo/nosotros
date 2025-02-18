import type { NostrFilter } from 'core/types'
import { dedupe } from './dedupe'

const formatFilterArray = (data: string[]) =>
  dedupe(data).filter((x) => {
    return !x.includes(':') && (x.length === 64 || import.meta.env.MODE === 'test')
  })

/**
 * Helper to creates a nostr filter object removing duplicates and null/undefined from array fields such as authors and ids
 */
export function createFilter(filter: NostrFilter): NostrFilter {
  const formatted = {} as NostrFilter
  if (filter.kinds?.length) {
    formatted.kinds = dedupe(filter.kinds)
  }
  if (filter.authors?.length) {
    formatted.authors = formatFilterArray(filter.authors)
  }
  if (filter.ids?.length) {
    formatted.ids = formatFilterArray(filter.ids)
  }
  if (filter['#e']?.length) {
    formatted['#e'] = formatFilterArray(filter['#e'])
  }
  if (filter['#p']?.length) {
    formatted['#p'] = formatFilterArray(filter['#p'])
  }
  const tags = Object.keys(filter).filter((x) => x[0] === '#') as (keyof Pick<NostrFilter, `#${string}`>)[]
  tags.forEach((tag) => {
    if (tag !== '#e' && tag !== '#p' && filter[tag]?.length) {
      formatted[tag] = dedupe(filter[tag])
    }
  })
  if (filter.until) {
    formatted.until = filter.until
  }
  if (filter.since) {
    formatted.since = filter.since
  }
  if (filter.search) {
    formatted.search = filter.search
  }
  if (filter.limit) {
    formatted.limit = filter.limit
  }
  return formatted
}
