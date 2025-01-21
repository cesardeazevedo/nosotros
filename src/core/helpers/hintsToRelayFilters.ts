import type { RelayFilters } from 'core/NostrSubscription'
import type { NostrFilter, RelayHints } from 'core/types'
import { dedupe } from './dedupe'
import { formatRelayUrl } from './formatRelayUrl'

export function hintsToRelayFilters(filters: NostrFilter[], hints?: RelayHints, relays: string[] = []) {
  const relayFilters = [] as RelayFilters[]
  for (const filter of filters) {
    if (filter.authors) {
      for (const author of filter.authors) {
        const relayAuthors = dedupe(hints?.authors?.[author])
          .filter((x) => !relays.includes(x))
          .slice(0, 4)
        for (const relay of relayAuthors) {
          relayFilters.push([formatRelayUrl(relay), [{ ...filter, authors: [author] }]])
        }
      }
    }
    if (filter.ids || filter['#e']) {
      for (const field of ['ids', '#e'] as const) {
        if (filter[field]) {
          for (const id of filter[field]) {
            const relayIds = dedupe(hints?.ids?.[id])
              .filter((x) => !relays.includes(x))
              .slice(0, 4)
            for (const relay of relayIds) {
              relayFilters.push([formatRelayUrl(relay), [{ ...filter, [field]: [id] }]])
            }
          }
        }
      }
    }
  }
  return relayFilters
}
