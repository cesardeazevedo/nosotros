import type { NostrFilter } from 'core/types'
import { DateTime } from 'luxon'
import { createFilter } from './createFilter'

// Move this function out of core package
export function createFilterPagination(filter: NostrFilter, range: number): NostrFilter {
  const now = DateTime.now()
  return {
    ...createFilter(filter),
    since: now.minus({ minutes: range }).toUnixInteger(),
    until: now.toUnixInteger(),
  }
}
