import type { SubscriptionOptions } from 'core/NostrSubscription'
import { NostrSubscription } from 'core/NostrSubscription'
import { merge, mergeAll } from 'rxjs'
import { mergeFilters } from './mergeFilters'
import { mergeRelayHints } from './mergeRelayHints'

export function mergeSubscriptions(subscriptions: NostrSubscription[], options?: SubscriptionOptions) {
  const filters = mergeFilters(subscriptions.flatMap((x) => x.filters))
  const relayHints = mergeRelayHints(subscriptions.flatMap((x) => x.relayHints || {}))
  const relayFilters = merge(subscriptions.map((x) => x.relayFilters)).pipe(mergeAll())

  return new NostrSubscription(filters, {
    relayHints,
    relayFilters,
    outbox: options?.outbox,
  })
}
