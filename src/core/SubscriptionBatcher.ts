import { mergeFilters } from '@/core/mergers/mergeFilters'
import type { NostrFilter, RelayHints } from '@/core/types'
import { type NostrEvent } from 'nostr-tools'
import type { Observable } from 'rxjs'
import { Subject, bufferTime, filter, from, mergeMap, share } from 'rxjs'
import { mergeRelayHints } from './mergers/mergeRelayHints'

type SubscriptionBatcherOptions = {
  batcherTime: number
}

export type SubscriptionBatchMeta = {
  subId?: string
  queryKey?: unknown
  maxRelaysPerUser?: number
  subscriptionGroupId?: string
}

export class SubscriptionBatcher<T = NostrEvent> {
  private queue = new Subject<
    [NostrFilter, RelayHints | undefined, cached: T[] | undefined, meta?: SubscriptionBatchMeta]
  >()
  $: Observable<T[]>

  constructor(
    subscriber: (
      filter: NostrFilter,
      relayHints: RelayHints,
      cached: T[],
      meta?: SubscriptionBatchMeta,
    ) => Observable<T[]>,
    options?: SubscriptionBatcherOptions,
  ) {
    this.queue = new Subject()
    this.$ = this.queue.pipe(
      bufferTime(options?.batcherTime || 800),
      filter((x) => x.length > 0),
      mergeMap((data) => {
        const filters = mergeFilters(data.map(([filter]) => filter))
        const relayHints = mergeRelayHints(data.map(([, hints]) => hints || {}))
        const meta = data[data.length - 1]?.[3]
        const cached = data
          .map(([, , cached]) => cached || [])
          .filter(Boolean)
          .flat()

        return from(filters).pipe(mergeMap((filter) => subscriber(filter, relayHints, cached, meta)))
      }),

      share(),
    )
    this.$.subscribe()
  }

  next(filter: NostrFilter, relayHints?: RelayHints, cached?: T[], meta?: SubscriptionBatchMeta) {
    this.queue.next([filter, relayHints, cached, meta])
  }
}
