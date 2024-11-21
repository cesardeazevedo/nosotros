import { isReplaceable } from '@/core/helpers'
import type { NostrFilter } from 'core/types'
import type { NostrEvent } from 'nostr-tools'
import type { OperatorFunction } from 'rxjs'
import { concatMap, EMPTY, filter, from, mergeAll, of, tap } from 'rxjs'
import { db } from '../db'

export function query(filters: NostrFilter[]) {
  if (filters.length > 0) {
    return from(db.event.query(filters)).pipe(mergeAll())
  }
  return EMPTY
}

export function insertEvent<T extends NostrEvent>(): OperatorFunction<T, T> {
  return concatMap((event) => {
    if (isReplaceable(event.kind)) {
      return of(event).pipe(
        concatMap((event) => db.event.insert(event)),
        // Filter out events that weren't inserted
        filter((x): x is T => !!x),
      )
    }
    return of(event).pipe(tap((event) => db.event.insert(event)))
  })
}
