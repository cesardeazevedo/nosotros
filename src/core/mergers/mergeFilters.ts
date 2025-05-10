import { Kind } from '@/constants/kinds'
import type { NostrFilter } from 'core/types'
import { isReplaceableKind } from 'nostr-tools/kinds'
import { pickBy } from '../helpers/pickBy'

export const FILTER_ARRAY_FIELDS = ['kinds', 'authors', 'ids', '#e', '#p'] as (keyof NostrFilter)[]

const unmergableFilters = [Kind.Follows, Kind.Mutelist]

export function mergeFilters(filters: NostrFilter[]): NostrFilter[] {
  const groups: Record<string, NostrFilter> = {}
  for (const filter of filters) {
    const mainKey = Object.keys(pickBy(filter, FILTER_ARRAY_FIELDS))
    const paginationKeys = JSON.stringify(pickBy(filter, ['until', 'limit', 'since', 'search', '#d']))
    const key =
      mainKey.toString() +
      paginationKeys +
      [...(filter.kinds || [])]
        // Do not merge follows kind, this needs some work
        .map((kind) =>
          unmergableFilters.includes(kind) ? kind : isReplaceableKind(kind) ? 'replaceable' : 'nonreplaceable',
        )
        .sort()
        .toString()

    if (!groups[key]) {
      groups[key] = structuredClone(filter)
    }
    for (const filterKey of FILTER_ARRAY_FIELDS) {
      const values = filter[filterKey]
      if (values && Array.isArray(values)) {
        for (const value of values) {
          if (value) {
            if ((groups[key][filterKey] as unknown[]).indexOf(value) === -1) {
              ;(groups[key][filterKey] as unknown[]).push(value)
            }
          }
        }
      }
    }
  }
  return Object.values(groups)
}
