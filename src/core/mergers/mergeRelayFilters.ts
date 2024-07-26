import { groupKeysFromArray, isFilterValid } from 'core/helpers'
import type { RelayFilters } from 'core/NostrSubscription'
import type { NostrFilter } from 'core/types'
import { mergeFilters } from './mergeFilters'

export function mergeRelayFilters(relayFilters: RelayFilters[], refine?: (filters: NostrFilter[]) => NostrFilter[]) {
  const grouped = groupKeysFromArray(relayFilters.map((data) => Object.fromEntries([data])))

  return (
    Object.entries(grouped)

      // Merge filters by relay
      .map(([relay, filters]) => [relay, [mergeFilters(filters)].flat()] as const)

      // Filter out any potential invalid/empty filters
      .map(([relay, filters]) => [relay, filters.filter(isFilterValid)] as const)

      // Refine filters
      .map(([relay, filters]) => [relay, refine?.(filters) || filters] as const)

      .filter(([, filters]) => filters.some(isFilterValid))
  )
}
