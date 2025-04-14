import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { NostrStoreModel } from '../nostr/nostr.model'
import { BaseModuleModel } from './base.module'

export const NostrModuleModule = t
  .compose(BaseModuleModel, NostrStoreModel)
  .named('NostrModuleModule')
  .props({
    type: t.optional(t.literal('event'), 'event'),
  })
  .views((self) => ({
    get eventId() {
      return self.filter.ids
        ? self.filter.ids[0]
        : [self.filter.kinds?.[0], self.filter.authors?.[0], self.filter['#d']?.[0]].join(':')
    },
  }))

export interface NostrModule extends Instance<typeof NostrModuleModule> {}
export interface NostrModuleSnapshotIn extends SnapshotIn<typeof NostrModuleModule> {}
