import type { NostrFilter } from '@/core/types'
import { EMPTY, from, mergeMap, take } from 'rxjs'
import { db } from '../db'

export function queryDB(filters: NostrFilter[]) {
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
