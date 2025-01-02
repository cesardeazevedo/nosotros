import type { SubscriptionOptions } from '@/core/NostrSubscription'
import type { NostrFilter } from '@/core/types'
import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'

export const NostrSubscriptionModel = t.model('FeedBaseModel', {
  filter: t.frozen<NostrFilter>(),
  subOptions: t.optional(t.frozen<SubscriptionOptions>(), {}),
})

export interface NostrSubscriptionInstance extends Instance<typeof NostrSubscriptionModel> {}
export interface NostrSubscriptionSnapshotIn extends SnapshotIn<typeof NostrSubscriptionModel> {}
