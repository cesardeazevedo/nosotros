import { NostrPublisher } from '@/core/NostrPublish'
import type { NostrSubscription } from '@/core/NostrSubscription'
import { publish } from '@/core/operators/publish'
import { subscribe } from '@/core/operators/subscribe'
import type { Pool } from '@/core/pool'
import type { NostrFilter } from '@/core/types'
import type { NostrEvent } from 'nostr-tools'
import type { OperatorFunction } from 'rxjs'
import { connect, filter, from, ignoreElements, map, merge, mergeMap, of } from 'rxjs'

export function query(pool: Pool, relays: string[], sub: NostrSubscription, filters?: NostrFilter[]) {
  return from(relays).pipe(
    map((url) => pool.get(url)),
    filter((relay) => !!relay),
    mergeMap((relay) => of(sub).pipe(subscribe(relay, filters || sub.filters))),
    map(([, event]) => event),
  )
}

export function insertEvent<T extends NostrEvent>(pool: Pool, relays: string[]): OperatorFunction<T, T> {
  return connect((shared$) => {
    return merge(
      shared$,
      shared$.pipe(
        map((event) => {
          return new NostrPublisher(undefined, {
            relays: of(relays),
            include: [event],
          })
        }),
        publish(pool),
        ignoreElements(),
      ),
    )
  })
}
