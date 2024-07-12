import type { SubscriptionOptions } from "core/NostrSubscription"
import { NostrSubscription } from "core/NostrSubscription"
import type { NostrFilter } from "core/types"
import { getOptimizedFilters } from "stores/operators/getOptimizedFilters"

export function createSubscription(filters: NostrFilter | NostrFilter[], options?: SubscriptionOptions) {
  return new NostrSubscription(getOptimizedFilters(filters), options)
}
