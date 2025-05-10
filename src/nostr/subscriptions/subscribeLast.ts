import { start } from '@/core/operators/start'
import type { NostrFilter } from '@/core/types'
import { last, map, mergeMap, of } from 'rxjs'
import type { NostrContext } from '../context'
import { parseEventMetadata } from '../operators/parseEventMetadata'
import { pool } from '../pool'
import { createSubscription } from './createSubscription'

export function subscribeLast(filter: NostrFilter, ctx: NostrContext) {
  const sub = createSubscription(filter, ctx)
  return of(sub).pipe(
    start(pool),
    map(([, event]) => event),
    last(undefined, null),
    mergeMap((event) => {
      if (event) {
        return of(event).pipe(parseEventMetadata())
      }
      return of(event)
    }),
  )
}
