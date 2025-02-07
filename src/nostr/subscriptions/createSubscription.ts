import { NostrSubscription } from '@/core/NostrSubscription'
import type { NostrFilter } from '@/core/types'
import { EMPTY, merge, of } from 'rxjs'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { pruneFilters } from '../prune'

export function createSubscription(
  filters: NostrFilter | NostrFilter[],
  client: NostrClient,
  options?: ClientSubOptions,
) {
  return new NostrSubscription(filters, {
    ...options,
    relays: merge(client.inbox$, client.outbox$, of(client.relays), options?.relays || EMPTY),
    relayHints: client.settings.hints ? options?.relayHints : {},
    outbox:
      client.settings.outbox && options?.outbox !== false
        ? client.outboxTracker.subscribe.bind(client.outboxTracker)
        : () => EMPTY,
    transform: options?.prune === false ? undefined : pruneFilters,
  })
}
