import { start } from '@/core/operators/start'
import { NostrSubscriptionBatcher } from 'core/NostrSubscriptionBatcher'
import { of } from 'rxjs'
import { pool } from './pool'

const lazy = new NostrSubscriptionBatcher({
  bufferTimeSpan: 700,
  subscribe: (parent) => of(parent).pipe(start(pool)),
})

const eager = new NostrSubscriptionBatcher({
  bufferTimeSpan: 100,
  subscribe: (parent) => of(parent).pipe(start(pool)),
})

export const batchers = {
  lazy: () => lazy.subscribe(),
  eager: () => eager.subscribe(),
  raw: () => start(pool),
  live: () => start(pool, false),
}
