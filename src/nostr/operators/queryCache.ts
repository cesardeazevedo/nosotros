import type { NostrFilter } from 'core/types'
import { storage } from 'nostr/storage'
import type { Observable, OperatorFunction } from 'rxjs'
import { delay, EMPTY, from, mergeAll, mergeWith } from 'rxjs'

export function queryCache(filters: NostrFilter[]) {
  if (filters.length > 0) {
    return from(storage.query(filters)).pipe(
      mergeAll(), // db connection
      mergeAll(), // async generators
    )
  }
  return EMPTY
}

export function withCache<T>(filters: NostrFilter[], delayTime?: number): OperatorFunction<T, T> {
  return mergeWith(queryCache(filters).pipe(delay(delayTime || 0)) as Observable<T>)
}
