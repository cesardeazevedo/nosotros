import type { NostrSubscription } from '@/core/NostrSubscription'
import { subscribe } from '@/core/operators/subscribe'
import type { Pool } from '@/core/pool'
import type { NostrFilter } from '@/core/types'
import { filter, from, map, mergeMap, of } from 'rxjs'

export function queryLocalRelay(pool: Pool, relays: string[], sub: NostrSubscription, filters?: NostrFilter[]) {
  return from(relays).pipe(
    map((url) => pool.get(url)),
    filter((relay) => !!relay),
    mergeMap((relay) => of(sub).pipe(subscribe(relay, filters || sub.filters))),
    map(([, event]) => event),
  )
}
