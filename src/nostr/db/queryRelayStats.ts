import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import type { RelayStatsDB } from '@/db/types'
import { BehaviorSubject, defaultIfEmpty, from, identity, mergeMap, reduce, shareReplay, switchMap, take } from 'rxjs'
import { db } from '../db'

export type RelayStatsDBMap = Record<string, RelayStatsDB>

const refresh$ = new BehaviorSubject<void>(undefined)

export const relayStats = refresh$.pipe(
  switchMap(() => {
    return from(db.relayStats.queryAll()).pipe(
      mergeMap(identity),
      reduce((acc, x) => ({ ...acc, [formatRelayUrl(x.url)]: x }), {} as RelayStatsDBMap),
      defaultIfEmpty({} as RelayStatsDBMap),
    )
  }),
  take(1),
  shareReplay(1),
)

export function updateRelayStats$() {
  refresh$.next()
}
