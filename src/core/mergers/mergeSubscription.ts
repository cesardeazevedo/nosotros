import { NostrSubscription } from 'core/NostrSubscription'
import { merge, mergeAll } from 'rxjs'

export function mergeSubscriptions(subscriptions: NostrSubscription[]) {
  const filters = subscriptions.flatMap((x) => x.filters)
  const relayFilters = merge(subscriptions.map((x) => x.relayFilters)).pipe(mergeAll())
  const events = new Map(subscriptions.flatMap((sub) => [...sub.events]))

  return new NostrSubscription(filters, {
    relayFilters,
    events,
  })
}
