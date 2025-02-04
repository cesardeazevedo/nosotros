import type { NostrFilter } from 'core/types'
import type { NostrEvent } from 'nostr-tools'
import { isParameterizedReplaceableKind, isReplaceableKind } from 'nostr-tools/kinds'
import type { OperatorFunction } from 'rxjs'
import { bufferTime, concatMap, EMPTY, filter, from, mergeMap, of, Subject, take, tap } from 'rxjs'
import { db } from '../db'

export function query(filters: NostrFilter[]) {
  if (filters.length > 0) {
    return from(filters).pipe(
      mergeMap((filter) => {
        const query = db.event.query(filter)
        if (filter.limit) {
          return from(query).pipe(take(filter.limit))
        }
        return from(query)
      }),
    )
  }
  return EMPTY
}

const insertBatch = new Subject<NostrEvent>()
insertBatch
  .pipe(
    bufferTime(4500),
    filter((x) => x.length > 0),
    tap((events) => db.event.insertBatch(events)),
  )
  .subscribe()

export function insertEvent<T extends NostrEvent>(): OperatorFunction<T, T> {
  return concatMap((event) => {
    if (isReplaceableKind(event.kind) || isParameterizedReplaceableKind(event.kind)) {
      return of(event).pipe(
        concatMap((event) => db.event.insert(event)),
        // Filter out events that weren't inserted
        filter((x): x is T => !!x),
      )
    }
    return of(event).pipe(tap((event) => insertBatch.next(event)))
  })
}
