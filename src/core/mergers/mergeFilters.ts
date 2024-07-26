import { dedupe, isReplaceable, pickBy } from 'core/helpers'
import type { NostrFilter } from 'core/types'

export const FILTER_ARRAY_FIELDS = ['kinds', 'authors', 'ids', '#e', '#p'] as (keyof NostrFilter)[]

export function mergeFilters(filters: NostrFilter[]): NostrFilter[] {
  const groups: Record<string, NostrFilter> = {}
  for (const filter of filters) {
    const mainKey = Object.keys(pickBy(filter, FILTER_ARRAY_FIELDS))
    const paginationKeys = JSON.stringify(pickBy(filter, ['until', 'limit', 'since', 'search']))
    const key =
      mainKey.toString() +
      paginationKeys +
      [...(filter.kinds || [])]
        .sort()
        .map((kind) => (isReplaceable(kind) ? 'replaceable' : kind))
        .toString()

    if (!groups[key]) {
      groups[key] = { ...filter }
    }
    for (const filterKey of FILTER_ARRAY_FIELDS) {
      const value = filter[filterKey] as string[]
      if (value) {
        ;(groups[key][filterKey] as string[]) = dedupe(groups[key][filterKey] as string[], value)
      }
    }
  }
  return Object.values(groups)
}
