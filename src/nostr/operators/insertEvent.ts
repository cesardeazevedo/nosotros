import { isReplaceable } from "core/helpers"
import type { NostrEvent } from "core/types"
import { storage } from "nostr/storage"
import type { OperatorFunction } from "rxjs"
import { concatMap, filter, iif, of, pipe, tap } from "rxjs"

function insertReplaceableEvent<T extends NostrEvent>(): OperatorFunction<T, T> {
  return pipe(
    concatMap((event) => storage.insert(event)),
    // Filter out events that weren't inserted
    filter((x): x is T => !!x),
  )
}

/**
 * Insert event on storage and merge the subscription cache into the stream
 */
export function insertEvent<T extends NostrEvent>(): OperatorFunction<T, T> {
  return pipe(
    concatMap((event) =>
      iif(
        () => isReplaceable(event.kind),
        // True
        of(event).pipe(insertReplaceableEvent()),
        // False
        of(event).pipe(tap((event) => storage.insert(event))),
      ),
    ),
  )
}
