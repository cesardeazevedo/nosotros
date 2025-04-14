import type { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '@/nostr/context'
import { t } from 'mobx-state-tree'
import { withToggleAction } from '../helpers/withToggleAction'

export const NostrStoreModel = t
  .model('NostrSubscriptionModel', {
    blured: false,
    filter: t.frozen<NostrFilter>(),
    context: t.frozen<NostrContext>(),
  })
  .views((self) => ({
    hasKind(kind: Kind) {
      return self.filter.kinds?.includes(kind)
    },
  }))
  .actions(withToggleAction)
  .actions((self) => ({
    addRelay(relay: string) {
      if (self.context?.relays) {
        self.context?.relays.push(relay)
      }
    },
    removeRelay(relay: string) {
      if (self.context?.relays) {
        self.context.relays = self.context.relays.filter((x) => x !== relay)
      }
    },
    setFilter(filter: NostrFilter) {
      self.filter = {
        ...filter,
      }
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
