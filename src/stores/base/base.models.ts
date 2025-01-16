import type { Kind } from '@/constants/kinds'
import type { SubscriptionOptions } from '@/core/NostrSubscription'
import type { NostrFilter } from '@/core/types'
import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { firstValueFrom, timer } from 'rxjs'

export const NostrSubscriptionModel = t
  .model('FeedBaseModel', {
    filter: t.frozen<NostrFilter>(),
    subOptions: t.optional(t.frozen<SubscriptionOptions>(), {}),
  })
  .volatile((self) => ({
    started: false,
    delay: firstValueFrom(timer(1000)),
    initialFilter: self.filter,
  }))
  .views((self) => ({
    hasKind(kind: Kind) {
      return self.filter.kinds?.includes(kind)
    },
  }))
  .actions((self) => ({
    resetFilter() {
      self.filter = {
        ...self.filter,
        kinds: self.initialFilter.kinds,
      }
    },
    toggleKind(kind: Kind) {
      const has = self.hasKind(kind)
      self.filter = {
        ...self.filter,
        kinds: has ? self.filter.kinds?.filter((x) => x !== kind) : [...(self.filter?.kinds || []), kind],
      }
    },
  }))

export interface NostrSubscriptionInstance extends Instance<typeof NostrSubscriptionModel> {}
export interface NostrSubscriptionSnapshotIn extends SnapshotIn<typeof NostrSubscriptionModel> {}
