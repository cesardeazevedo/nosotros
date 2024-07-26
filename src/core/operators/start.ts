import { mergeRelayFilters } from 'core/mergers/mergeRelayFilters'
import type { NostrSubscription } from 'core/NostrSubscription'
import type { Pool } from 'core/pool'
import type { NostrEvent, NostrFilter } from 'core/types'
import type { OperatorFunction } from 'rxjs'
import { EMPTY, filter, from, identity, map, mergeMap, of, takeUntil, timer } from 'rxjs'
import { bufferTime } from './bufferTime'
import { subscribe } from './subscribe'

// define refine here, but that also could be an operator
export function start(
  pool: Pool,
  refine?: (filters: NostrFilter[]) => NostrFilter[],
): OperatorFunction<NostrSubscription, [string, NostrEvent]> {
  return mergeMap((sub) => {
    return from(sub.relayFilters).pipe(
      filter(([, filters]) => filters.length > 0),

      bufferTime(500),

      map((relayFilters) => mergeRelayFilters(relayFilters, refine)),

      mergeMap(identity),

      mergeMap(([url, filters]) => {
        const relay = pool.getOrAddRelay(url)

        if (relay) {
          return of(sub).pipe(subscribe(relay, filters))
        }
        return EMPTY
      }),

      takeUntil(timer(8000)),
    )
  })
}
