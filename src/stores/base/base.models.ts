import type { Kind } from '@/constants/kinds'
import type { SubscriptionOptions } from '@/core/NostrSubscription'
import type { NostrFilter } from '@/core/types'
import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { firstValueFrom, timer } from 'rxjs'
import { withToggleAction } from '../helpers/withToggleAction'

export const NostrSubscriptionModel = t
  .model('NostrSubscriptionModel', {
    blured: false,
    filter: t.frozen<NostrFilter>(),
    subOptions: t.optional(t.frozen<SubscriptionOptions>(), {}),
  })
  .volatile((self) => ({
    started: false,
    delay: firstValueFrom(timer(0)),
    initialFilter: self.filter,
  }))
  .views((self) => ({
    hasKind(kind: Kind) {
      return self.filter.kinds?.includes(kind)
    },
  }))
  .actions(withToggleAction)
  .actions((self) => ({
    setFilter(filter: NostrFilter) {
      self.filter = {
        ...self.filter,
        ...filter,
      }
    },
    resetFilter() {
      this.setFilter({ kinds: self.initialFilter.kinds })
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
