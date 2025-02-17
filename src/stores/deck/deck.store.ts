import { cast, t } from 'mobx-state-tree'
import { createHome } from '../modules/home.module'
import { createMediaModule } from '../modules/media.module'
import { ModuleStoreModel, type ModulesInstances } from '../modules/module.store'
import { createNAddressModule } from '../modules/naddress.module'
import { createNEventModule } from '../modules/nevent.module'
import { createNotificationModule } from '../modules/notification.module'
import { createSearchModule } from '../modules/search.module'
import { createTagModule } from '../modules/tag.module'
import { createNprofileModule } from '../nprofile/nprofile.module'
import { createRelayFeedModule } from '../relays/relay.feed.module'

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
    add(module: ModulesInstances, index?: number, replace?: boolean) {
      const id = module.id
      if (replace && typeof index === 'number') {
        const oldId = self.columns[index]
        self.modules.delete(oldId)
        self.modules.add(module)
        self.columns.splice(index - 1, 1, id)
      } else {
        self.modules.add(module)
        self.columns.splice(index || self.columns.length, 0, id)
        return module
      }
    },
  }))
  .actions((self) => ({
    addHome(snapshot: Parameters<typeof createHome>[0]) {
      self.add(createHome(snapshot))
    },

    addNotification(snapshot: Parameters<typeof createNotificationModule>[0]) {
      self.add(createNotificationModule(snapshot))
    },

    addNProfile(options: Parameters<typeof createNprofileModule>[0], index?: number) {
      self.add(createNprofileModule(options), index)
    },

    addNEvent(snapshot: Parameters<typeof createNEventModule>[0], index?: number, replace?: boolean) {
      self.add(createNEventModule(snapshot), index, replace)
    },

    addNAddr(snapshot: Parameters<typeof createNAddressModule>[0], index?: number) {
      self.add(createNAddressModule(snapshot), index)
    },

    addMedia(snapshot: Parameters<typeof createMediaModule>[0], index?: number) {
      self.add(createMediaModule(snapshot), index)
    },

    addSearch(snapshot: Parameters<typeof createSearchModule>[0], index?: number) {
      self.add(createSearchModule(snapshot), index)
    },

    addTag(tags: string[], index?: number) {
      self.add(createTagModule(tags), index)
    },

    addRelayFeed(relays: string[], index?: number) {
      self.add(createRelayFeedModule(relays), index)
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
