import type { NostrFilter } from 'core/types'

export function isFilterValid(filter: NostrFilter): boolean {
  const hasIds = (filter.ids?.length ?? 0) > 0
  const hasSearch = typeof filter.search === 'string' && filter.search.length > 0
  const hasAuthors = (filter.authors?.length ?? 0) > 0
  const hasKinds = (filter.kinds?.length ?? 0) > 0

  const hasTag = Object.keys(filter).some(
    (key) => key.startsWith('#') && (filter[key as keyof NostrFilter[`#${string}`]]?.length ?? 0) > 0,
  )

  const hasTimeRange = typeof filter.since === 'number' || typeof filter.until === 'number'
  const hasLimit = typeof filter.limit === 'number' && filter.limit > 0

  return hasIds || hasSearch || hasAuthors || (hasKinds && (hasIds || hasAuthors || hasTag || hasTimeRange || hasLimit))
}
