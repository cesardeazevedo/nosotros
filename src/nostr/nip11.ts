import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import { fetchRelayInfo } from '@/core/observable/fetchRelayInfo'
import { relaysStore } from '@/stores/relays/relays.store'
import { identity } from 'observable-hooks'
import {
  bufferTime,
  catchError,
  concatMap,
  EMPTY,
  filter,
  from,
  map,
  mergeMap,
  Subject,
  take,
  takeUntil,
  tap,
  timer,
} from 'rxjs'
import { db } from './db'

const subject = new Subject<string>()
const queue$ = subject.pipe(
  bufferTime(1000),
  mergeMap(identity),
  concatMap((url) => from(db.relayInfo.query(formatRelayUrl(url))).pipe(map((x) => [url, x] as const))),
  tap(([, info]) => {
    if (info) {
      relaysStore.addInfo(info)
    }
  }),
  filter(([, info]) => {
    if (info) {
      return Date.now() > (info?.timestamp || 0) + 86400 * 1000
    }
    return true
  }),
  concatMap(([url]) => {
    return from(fetchRelayInfo(url)).pipe(
      map((x) => [url, x] as const),
      takeUntil(timer(2500)),
      catchError(() => EMPTY),
    )
  }),
  mergeMap(([url, info]) => db.relayInfo.insert(url, info)),
)
queue$.subscribe()

export function enqueueRelayInfo(url: string | undefined) {
  if (url) {
    subject.next(url)
    return queue$.pipe(
      filter((x) => x.url === url),
      take(1),
    )
  }
  return EMPTY
}
