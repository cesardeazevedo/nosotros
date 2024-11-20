import type { NostrFilter } from 'core/types'
import { DateTime } from 'luxon'

export function paginateFilter(filter: NostrFilter, range: number): NostrFilter {
  if (filter.since && filter.until) {
    const since = DateTime.fromSeconds(filter.since).minus({ minutes: range })
    return {
      ...filter,
      since: since.toUnixInteger(),
      until: since.plus({ minutes: range }).toUnixInteger(),
    }
  }
  return filter
}
