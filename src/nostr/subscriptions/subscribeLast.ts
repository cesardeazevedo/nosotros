import { start } from '@/core/operators/start'
import type { NostrFilter } from '@/core/types'
import { last, map, of } from 'rxjs'
import type { NostrContext } from '../context'
import { pool } from '../pool'
import { createSubscription } from './createSubscription'

export function subscribeLast(filter: NostrFilter, ctx: NostrContext) {
  const sub = createSubscription(filter, ctx)
  return of(sub).pipe(
    start(pool),
    map(([, event]) => event),
    last(undefined, null),
  )
}
