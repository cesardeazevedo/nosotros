import { NostrSubscriptionBatcher } from "core/NostrSubscriptionBatcher"
import { pool } from "./pool"

export const batcher = new NostrSubscriptionBatcher({
  subscribe: (parent) => pool.subscribe(parent)
})
