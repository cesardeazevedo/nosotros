import { NostrSubscription } from 'core/NostrSubscription'
import type { Pool } from 'core/pool'
import type { NostrEvent } from 'core/types'
import type { OperatorFunction } from 'rxjs'
import { bufferTime, catchError, EMPTY, filter, from, mergeMap, take } from 'rxjs'
import { mergeRelayFilters } from '../mergers/mergeRelayFilters'
import type { NostrSubscriptionBuilder } from '../NostrSubscriptionBuilder'
import { subscribe } from './subscribe'
import { subscribeNeg } from './subscribeNeg'

export function start(pool: Pool): OperatorFunction<NostrSubscriptionBuilder, [string, NostrEvent]> {
  return mergeMap((sub) => {
    return sub.relayFilters.pipe(
      bufferTime(800),

      filter((items) => items.length > 0),

      mergeMap((relayFilters) => mergeRelayFilters(relayFilters)),

      mergeMap(([url, filters]) => {
        const relay = pool.get(url)
        if (relay && filters.length > 0) {
          // Create 1 subscription per filter
          const subs = filters.map((filter) => new NostrSubscription(filter, { id: sub.id || '', events: sub.events }))
          if (sub.negentropy !== false) {
            return relay.negentropy$.pipe(
              take(1),
              mergeMap((enabled) => {
                if (enabled) {
                  return from(subs).pipe(
                    subscribeNeg(relay),
                    catchError(() => from(subs).pipe(subscribe(relay, sub.closeOnEose))),
                  )
                }
                return from(subs).pipe(subscribe(relay, sub.closeOnEose))
              }),
            )
          }
          return from(subs).pipe(subscribe(relay, sub.closeOnEose))
        }
        return EMPTY
      }),
    )
  })
}
