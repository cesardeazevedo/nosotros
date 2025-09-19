import type { NostrEvent } from 'nostr-tools'
import { createFilter } from './helpers/createFilter'
import { makeSubId } from './helpers/kindsToId'
import type { NostrFilter } from './types'

export type RelayFilters = [string, NostrFilter]

export type SubscriptionOptions = {
  id?: string
  events?: Map<string, { id: string; created_at: number }>
}

export class NostrSubscription {
  readonly id: string
  readonly filter: NostrFilter
  events: Map<string, NostrEvent>

  constructor(filter: NostrFilter, options?: SubscriptionOptions) {
    this.id = makeSubId(options?.id, filter.kinds)
    this.filter = createFilter(filter)
    this.events = options?.events || new Map()
  }
}
