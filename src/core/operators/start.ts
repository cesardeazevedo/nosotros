import { mergeRelayFilters } from 'core/mergers/mergeRelayFilters'
import type { NostrSubscription } from 'core/NostrSubscription'
import type { Pool } from 'core/pool'
import type { NostrEvent, NostrFilter } from 'core/types'
import type { OperatorFunction } from 'rxjs'
import { filter, from, map, mergeAll, mergeMap, NEVER, of, reduce } from 'rxjs'
import { subscribe } from './subscribe'

export function start(pool: Pool): OperatorFunction<NostrSubscription, [string, NostrEvent]> {
  return mergeMap((sub) => {
    return from(sub.relayFilters).pipe(
      filter((x) => x.length > 0 && Object.keys(x[0]).length > 0),

      // bufferTime(100), // test
      reduce((acc, x) => [...acc, ...x], [] as Record<string, NostrFilter[]>[]),

      map((x) => mergeRelayFilters(x)),

      mergeMap((x) =>
        Object.entries(x).map(([url, filters]) => {
          const relay = pool.getOrAddRelay(url)
          if (relay) {
            return of(sub).pipe(subscribe(relay, filters))
          }
          return NEVER
        }),
      ),

      mergeAll(),
    )
  })
}
