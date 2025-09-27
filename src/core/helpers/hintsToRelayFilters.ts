import type { RelayFilters } from 'core/NostrSubscription'
import type { NostrFilter, RelayHints } from 'core/types'
import { dedupe } from './dedupe'
import { formatRelayUrl } from './formatRelayUrl'

export function hintsToRelayFilters(filter: NostrFilter, hints?: RelayHints) {
  const relayFilters = [] as RelayFilters[]
  if (Object.keys(hints || {}).length > 0) {
    if (filter.authors) {
      for (const author of filter.authors) {
        for (const relay of dedupe(hints?.authors?.[author] || [])) {
          relayFilters.push([formatRelayUrl(relay), { ...filter, authors: [author] }])
        }
      }
    }
    if (filter.ids || filter['#e']) {
      for (const field of ['ids', '#e'] as const) {
        for (const id of filter[field] || []) {
          for (const relay of dedupe(hints?.ids?.[id] || [])) {
            relayFilters.push([formatRelayUrl(relay), { ...filter, [field]: [id] }])
          }
        }
      }
    }
    if (filter['#d'] && filter.kinds && filter.authors) {
      const id = [filter.kinds[0], filter.authors[0], filter['#d'][0]].join(':')
      for (const relay of dedupe(hints?.ids?.[id] || [])) {
        relayFilters.push([formatRelayUrl(relay), filter])
      }
    }
  }
  return relayFilters
}
