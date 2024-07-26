import { NostrSubscriptionBatcher } from 'core/NostrSubscriptionBatcher'
import { pool } from './pool'
import { getOptimizedFilters } from 'stores/operators/getOptimizedFilters'

export const batcher = new NostrSubscriptionBatcher({
  subscribe: (parent) => pool.subscribe(parent, (filters) => getOptimizedFilters(filters)),
})
