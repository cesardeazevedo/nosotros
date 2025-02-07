import type { NostrEvent } from 'nostr-tools'
import { isParameterizedReplaceableKind, isReplaceableKind } from 'nostr-tools/kinds'
import type { OperatorFunction } from 'rxjs'
import { bufferTime, concatMap, filter, of, Subject, tap } from 'rxjs'
import { db } from '../db'

const insertBatch = new Subject<NostrEvent>()
insertBatch
  .pipe(
    bufferTime(4500),
    filter((x) => x.length > 0),
    tap((events) => db.event.insertBatch(events)),
  )
  .subscribe()

export function insertDB<T extends NostrEvent>(): OperatorFunction<T, T> {
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
