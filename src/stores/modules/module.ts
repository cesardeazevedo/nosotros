import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { NostrContextModel } from '../context/nostr.context.store'

export const BaseModuleModel = t.model('ModuleModel', {
  id: t.optional(t.identifier, () => Math.random().toString().slice(2)),
  context: t.maybe(t.late(() => NostrContextModel)),
})

export interface BaseModule extends Instance<typeof BaseModuleModel> {}
export interface BaseModuleSnapshotIn extends SnapshotIn<typeof BaseModuleModel> {}
