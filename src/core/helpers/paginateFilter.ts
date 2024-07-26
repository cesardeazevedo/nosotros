import type { NostrFilter } from 'core/types'
import { DateTime } from 'luxon'

export function paginateFilter(filter: NostrFilter, range = 60): NostrFilter {
  if (filter.since && filter.until) {
    const since = DateTime.fromSeconds(filter.since)
    return {
      ...filter,
      since: since.minus({ minutes: range }).toUnixInteger(),
      until: since.plus({ minutes: range }).toUnixInteger(),
    }
  }
  return filter
}
