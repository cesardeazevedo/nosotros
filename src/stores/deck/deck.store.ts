import type { Instance } from 'mobx-state-tree'
import { cast, t } from 'mobx-state-tree'
import type { FeedScope } from '../feeds/feed.notes'
import { createHome } from '../home/home.module'
import { ModuleStoreModel, type ModulesInstances } from '../modules/module.store'
import { createNAddressModule } from '../naddress/naddress.module'
import { createNEventModule } from '../nevent/nevent.module'
import { createNotificationModule } from '../notifications/notification.module'
import { createNprofileModule } from '../nprofile/nprofile.module'

export const DeckModel = t
  .model('DeckModel', {
    id: t.identifier,
    columns: t.array(t.string),
    modules: ModuleStoreModel,
  })
  .views((self) => ({
    get list() {
      return self.columns.map((col) => self.modules.get(col)).filter((x) => !!x)
    },
  }))
  .actions((self) => ({
    add(module: ModulesInstances, index?: number) {
      const id = module.id
      self.modules.add(module)
      self.columns.splice(index || self.columns.length, 0, id)
      return module
    },
  }))
  .actions((self) => ({
    addHome(snapshot: { id?: string; scope?: Instance<typeof FeedScope>; authors: string[] }) {
      self.add(createHome(snapshot))
    },

    addNotification(snapshot: Parameters<typeof createNotificationModule>[0]) {
      self.add(createNotificationModule(snapshot))
    },

    addNProfile(options: Parameters<typeof createNprofileModule>[0], index?: number) {
      self.add(createNprofileModule(options), index)
    },

    addNEvent(snapshot: Parameters<typeof createNEventModule>[0], index?: number) {
      self.add(createNEventModule(snapshot), index)
    },

    addNAddr(snapshot: Parameters<typeof createNAddressModule>[0], index?: number) {
      self.add(createNAddressModule(snapshot), index)
    },

    reset() {
      self.columns.clear()
    },

    delete(id: string) {
      self.modules.delete(id)
      self.columns = cast(self.columns.filter((x) => x !== id))
    },
  }))

export const DeckStoreModel = t.model('DeckStoreModel', {
  selected: t.reference(DeckModel),
  decks: t.map(DeckModel),
})
