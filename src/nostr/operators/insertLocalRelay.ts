import { NostrPublisher } from '@/core/NostrPublish'
import { broadcast } from '@/core/operators/broadcast'
import type { Pool } from '@/core/pool'
import type { NostrEvent } from 'nostr-tools'
import type { OperatorFunction } from 'rxjs'
import { connect, ignoreElements, map, merge, of } from 'rxjs'

export function insertLocalRelay<T extends NostrEvent>(pool: Pool, relays: string[]): OperatorFunction<T, T> {
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
        broadcast(pool),
        ignoreElements(),
      ),
    )
  })
}
