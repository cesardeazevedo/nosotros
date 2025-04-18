import type { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import { t } from 'mobx-state-tree'
import { withToggleAction } from '../helpers/withToggleAction'
import { NostrContextModel } from './nostr.context.model'

export const NostrStoreModel = t
  .model('NostrSubscriptionModel', {
    blured: false,
    filter: t.frozen<NostrFilter>(),
    context: NostrContextModel,
  })
  .views((self) => ({
    hasKind(kind: Kind) {
      return self.filter.kinds?.includes(kind)
    },
  }))
  .actions(withToggleAction)
  .actions((self) => ({
    setFilter(filter: NostrFilter) {
      self.filter = filter
    },
    resetFilter() {},
    toggleKind(kind: Kind) {
      const has = self.hasKind(kind)
      self.filter = {
        ...self.filter,
        kinds: has ? self.filter.kinds?.filter((x) => x !== kind) : [...(self.filter?.kinds || []), kind],
      }
    },
  }))
