import { groupKeysFromArray, isFilterValid } from "core/helpers"
import type { NostrFilter } from "core/types"
import { mergeFilters } from "./mergeFilters"

export function mergeRelayFilters(relayFilters: Record<string, NostrFilter[]>[]) {
  const grouped = groupKeysFromArray(relayFilters)
  const entries = Object.entries(grouped)
  const merged = entries
    // Merge filters by relay
    .map(([relay, filters]) => [relay, [mergeFilters(filters)].flat()] as const)
    // Filter out any potential invalid/empty filters
    .map(([relay, filters]) => [relay, filters.filter(isFilterValid)] as const)

    .filter(([, filters]) => filters.some(isFilterValid))
  return Object.fromEntries(merged)
}
