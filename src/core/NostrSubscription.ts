import { createFilter } from './helpers/createFilter'
import { makeSubId } from './helpers/kindsToId'
import type { NostrFilter } from './types'

export type RelayFilters = [string, NostrFilter]

export type SubscriptionOptions = {
  id?: string
  groupId?: string
  childId?: string
}

export class NostrSubscription {
  readonly groupId: string | undefined
  readonly childId: string | undefined
  readonly id: string
  readonly filter: NostrFilter

  constructor(filter: NostrFilter, options?: SubscriptionOptions) {
    this.groupId = options?.groupId
    this.childId = options?.childId
    this.id = makeSubId(options?.id, filter.kinds)
    this.filter = createFilter(filter)
  }
}
