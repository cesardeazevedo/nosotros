import { isFilterValid } from 'core/helpers'
import type { RelayFilters } from 'core/NostrSubscription'
import type { NostrFilter } from 'core/types'
import { mergeFilters } from './mergeFilters'

export function mergeRelayFilters(relayFilters: RelayFilters[]) {
  const grouped: Record<string, NostrFilter[]> = {}

  for (const relayFilter of relayFilters) {
    const relay = relayFilter[0]
    const filters = relayFilter[1]
    grouped[relay] ??= []
    filters.forEach((filter) => {
      if (isFilterValid(filter)) {
        grouped[relay].push(filter)
      }
    })
  }

  const result: [string, NostrFilter[]][] = []

  for (const [relay, filters] of Object.entries(grouped)) {
    const merged = mergeFilters(filters)
    if (merged.length > 0) {
      result.push([relay, merged])
    }
  }
  return result
}
