import type { Instance } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'

export const BaseModuleModel = t.model('BaseModuleModel', {
  id: t.optional(t.identifier, () => Math.random().toString().slice(2)),
})

export interface BaseModule extends Instance<typeof BaseModuleModel> {}
