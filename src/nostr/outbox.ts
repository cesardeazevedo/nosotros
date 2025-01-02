import type { RelayFilters } from '@/core/NostrSubscription'
import type { NostrFilter, RelayHints } from '@/core/types'
import { filter, from, identity, map, merge, mergeMap, takeUntil, timer } from 'rxjs'
import type { RelaySelectionConfig } from './helpers/relaySelection'
import { WRITE } from './nips/nip65.relaylist'
import type { NostrClient } from './nostr'

export class OutboxTracker {
  private options: RelaySelectionConfig

  constructor(private client: NostrClient) {
    this.options = {
      permission: WRITE,
      ignore: client.outboxSets,
      maxRelaysPerUser: client.settings.maxRelaysPerUserOutbox,
    }
  }

  private trackPubkeys(filter: NostrFilter, tag: keyof Pick<NostrFilter, 'authors' | '#p'>) {
    return from(filter[tag] || []).pipe(
      mergeMap((pubkey) => this.client.mailbox.track(pubkey, this.options)),
      mergeMap(identity),
      map(({ relay, pubkey }) => [relay, [{ ...filter, [tag]: [pubkey] }]] as RelayFilters),
    )
  }

  private trackIds(filter: NostrFilter, hints?: RelayHints) {
    return from(Object.entries(hints?.fallback || {})).pipe(
      mergeMap(([id, pubkeys]) => {
        return from(pubkeys).pipe(
          mergeMap((pubkey) => this.client.mailbox.track(pubkey, this.options)),
          mergeMap(identity),
          map((userRelay) => [id, userRelay.relay]),
        )
      }),
      map(([id, relay]) => [relay, [{ ...filter, ids: [id] }]] as RelayFilters),
    )
  }

  subscribe(filters: NostrFilter[], hints?: RelayHints) {
    return from(filters).pipe(
      mergeMap((filter) => {
        // Track relays based on pubkey hints
        const ids$ = this.trackIds(filter, hints)
        // Build relays for authors
        const authors$ = this.trackPubkeys(filter, 'authors')
        // Build relays for #p authors
        const p$ = this.trackPubkeys(filter, '#p')

        return merge(ids$, authors$, p$)
      }),

      filter((x) => x.length > 0),

      takeUntil(timer(4000)),
    )
  }
}
