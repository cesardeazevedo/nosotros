import { createFilter } from './helpers/createFilter'
import { makeSubId } from './helpers/kindsToId'
import type { NostrFilter } from './types'

export type RelayFilters = [string, NostrFilter]

export type SubscriptionOptions = {
  id?: string
}

export class NostrSubscription {
  readonly id: string
  readonly filter: NostrFilter

  constructor(filter: NostrFilter, options?: SubscriptionOptions) {
    this.id = makeSubId(options?.id, filter.kinds)
    this.filter = createFilter(filter)
  }
}
