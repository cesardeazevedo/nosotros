import type { RelayFilters } from 'core/NostrSubscription'
import type { NostrFilter, RelayHints } from 'core/types'
import { dedupe } from './dedupe'
import { formatRelayUrl } from './formatRelayUrl'

export function hintsToRelayFilters(filters: NostrFilter[], hints?: RelayHints) {
  const relayFilters = [] as RelayFilters[]
  for (const filter of filters) {
    if (filter.authors) {
      for (const author of filter.authors) {
        for (const relay of dedupe(hints?.authors?.[author])) {
          relayFilters.push([formatRelayUrl(relay), [{ ...filter, authors: [author] }]])
        }
      }
    }
    if (filter.ids || filter['#e']) {
      for (const field of ['ids', '#e'] as const) {
        if (filter[field]) {
          for (const id of filter[field]) {
            for (const relay of dedupe(hints?.ids?.[id])) {
              relayFilters.push([formatRelayUrl(relay), [{ ...filter, [field]: [id] }]])
            }
          }
        }
      }
    }
  }
  return relayFilters
}
