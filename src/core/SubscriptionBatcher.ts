import { mergeFilters } from '@/core/mergers/mergeFilters'
import type { NostrFilter, RelayHints } from '@/core/types'
import { type NostrEvent } from 'nostr-tools'
import type { Observable } from 'rxjs'
import { Subject, bufferTime, filter, from, mergeMap, share } from 'rxjs'
import { mergeRelayHints } from './mergers/mergeRelayHints'

type SubscriptionBatcherOptions = {
  batcherTime: number
}

export class SubscriptionBatcher<T = NostrEvent> {
  private queue = new Subject<[NostrFilter, RelayHints | undefined, cached: T[] | undefined]>()
  $: Observable<T[]>

  constructor(
    subscriber: (filter: NostrFilter, relayHints: RelayHints, cached: T[]) => Observable<T[]>,
    options?: SubscriptionBatcherOptions,
  ) {
    this.queue = new Subject()
    this.$ = this.queue.pipe(
      bufferTime(options?.batcherTime || 800),
      filter((x) => x.length > 0),
      mergeMap((data) => {
        const filters = mergeFilters(data.map(([filter]) => filter))
        const relayHints = mergeRelayHints(data.map(([, hints]) => hints || {}))
        const cached = data
          .map(([, , cached]) => cached || [])
          .filter(Boolean)
          .flat()

        return from(filters).pipe(mergeMap((filter) => subscriber(filter, relayHints, cached)))
      }),

      share(),
    )
    this.$.subscribe()
  }

  next(filter: NostrFilter, relayHints?: RelayHints, cached?: T[]) {
    this.queue.next([filter, relayHints, cached])
  }
}
