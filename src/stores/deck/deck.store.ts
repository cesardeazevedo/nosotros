import { DEFAULT_RELAYS } from '@/constants/relays'
import { cast, t } from 'mobx-state-tree'
import { HomeModuleModel } from '../home/home.module'
import { ModuleStoreModel, type ModulesInstances } from '../modules/module.store'
import type { NEventModuleSnapshotIn } from '../nevent/nevent.module'
import { NEventModuleModel } from '../nevent/nevent.module'
import type { NotificationModuleSnapshotIn } from '../notifications/notification.module'
import { NotificationModuleModel } from '../notifications/notification.module'
import { NProfileModuleModel } from '../nprofile/nprofile.module'
import { WelcomeModuleModel } from '../welcome/welcome.module'

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
    addHome(pubkey: string) {
      self.add(HomeModuleModel.create({ pubkey }))
    },

    addWelcome() {
      self.add(WelcomeModuleModel.create({}))
    },

    addNotification(snapshot: NotificationModuleSnapshotIn) {
      self.add(NotificationModuleModel.create(snapshot))
    },

    addNProfile(options: { pubkey: string; relays?: string[] }, index?: number) {
      self.add(
        NProfileModuleModel.create({
          options,
          context: {
            options: {
              pubkey: options.pubkey,
              relays: options.relays || DEFAULT_RELAYS,
            },
          },
        }),
        index,
      )
    },

    addNEvent(snapshot: NEventModuleSnapshotIn, index?: number) {
      self.add(NEventModuleModel.create(snapshot), index)
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
