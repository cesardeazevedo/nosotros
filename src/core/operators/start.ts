import { mergeRelayFilters } from 'core/mergers/mergeRelayFilters'
import type { NostrSubscription } from 'core/NostrSubscription'
import type { Pool } from 'core/pool'
import type { NostrEvent } from 'core/types'
import type { OperatorFunction } from 'rxjs'
import { EMPTY, identity, map, mergeMap, of } from 'rxjs'
import { bufferTime } from './bufferTime'
import { subscribe } from './subscribe'

export function start(pool: Pool): OperatorFunction<NostrSubscription, [string, NostrEvent]> {
  return mergeMap((sub) => {
    return sub.relayFilters.pipe(
      bufferTime(500),

      map((relayFilters) => mergeRelayFilters(relayFilters)),

      mergeMap(identity),

      mergeMap(([url, filters]) => {
        const relay = pool.get(url)

        if (relay && filters.length > 0) {
          return of(sub).pipe(subscribe(relay, filters))
        }
        return EMPTY
      }),
    )
  })
}
