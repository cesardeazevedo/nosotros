import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import type { NostrStore } from '../nostr/nostr.context.store'
import { NostrStoreModel } from '../nostr/nostr.context.store'
import { getRootStore } from '../helpers/getRootStore'

export const BaseModuleModel = t
  .model('BaseModuleModel', {
    id: t.optional(t.identifier, () => Math.random().toString().slice(2)),
    context: t.late(() => t.maybe(NostrStoreModel)),
  })
  .views((self) => ({
    get contextWithFallback(): NostrStore {
      const root = getRootStore(self)
      return self.context || root.rootContext
    },
  }))

export interface BaseModule extends Instance<typeof BaseModuleModel> {}
export interface BaseModuleSnapshotIn extends SnapshotIn<typeof BaseModuleModel> {}
