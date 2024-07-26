import { FILTER_ARRAY_FIELDS } from 'core/mergers/mergeFilters'
import type { NostrFilter } from 'core/types'
import { dedupe } from './dedupe'

/**
 * Helper to creates a nostr filter object removing duplicates and null/undefined from array fields such as authors and ids
 */
export function createFilter(filter: NostrFilter): NostrFilter {
  return Object.entries(filter).reduce((acc: Record<string, unknown>, [key, value]) => {
    if (!FILTER_ARRAY_FIELDS.includes(key as keyof NostrFilter)) {
      acc[key] = value
    } else if (Array.isArray(value) && value.length > 0) {
      acc[key] = dedupe(value as string[])
    }
    return acc
  }, {}) as NostrFilter
}
