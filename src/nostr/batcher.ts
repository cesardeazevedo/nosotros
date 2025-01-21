import { start } from '@/core/operators/start'
import { NostrSubscriptionBatcher } from 'core/NostrSubscriptionBatcher'
import { of } from 'rxjs'
import { pool } from './pool'

export const batcher = new NostrSubscriptionBatcher({
  subscribe: (parent) => of(parent).pipe(start(pool)),
})
