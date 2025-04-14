import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import type { RelayStatsDB } from '@/db/types'
import {
  BehaviorSubject,
  defaultIfEmpty,
  firstValueFrom,
  from,
  identity,
  mergeMap,
  reduce,
  shareReplay,
  skip,
  switchMap,
} from 'rxjs'
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
  shareReplay(1),
)

export async function updateRelayStats$() {
  refresh$.next()
  return firstValueFrom(relayStats.pipe(skip(1)))
}
