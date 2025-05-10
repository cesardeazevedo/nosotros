import type { NostrSubscription } from '@/core/NostrSubscription'
import { subscribe } from '@/core/operators/subscribe'
import { filter, from, map, mergeMap, of } from 'rxjs'
import { pool } from '../pool'

export function queryLocalRelay(relays: string[], sub: NostrSubscription) {
  return from(relays).pipe(
    map((url) => pool.get(url)),
    filter((relay) => !!relay),
    mergeMap((relay) => of(sub).pipe(subscribe(relay, sub.filters))),
    map(([, event]) => event),
  )
}
