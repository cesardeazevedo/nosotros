import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import type { NostrContext } from '../context/nostr.context.store'
import { NostrContextModel } from '../context/nostr.context.store'
import { getRootStore } from '../helpers/getRootStore'

export const BaseModuleModel = t
  .model('ModuleModel', {
    id: t.optional(t.identifier, () => Math.random().toString().slice(2)),
    context: t.late(() => t.maybe(NostrContextModel)),
  })
  .views((self) => ({
    get contextWithFallback(): NostrContext {
      const root = getRootStore(self)
      return self.context || root.rootContext
    },
  }))

export interface BaseModule extends Instance<typeof BaseModuleModel> {}
export interface BaseModuleSnapshotIn extends SnapshotIn<typeof BaseModuleModel> {}
