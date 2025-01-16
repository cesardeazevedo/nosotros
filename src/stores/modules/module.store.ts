import type { Instance } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import type { HomeModule, HomeModuleSnapshotOut } from '../home/home.module'
import { HomeModuleModel } from '../home/home.module'
import { NEventModuleModel, type NEventModule, type NEventModuleSnapshotOut } from '../nevent/nevent.module'
import type { NotificationModule, NotificationModuleSnapshotOut } from '../notifications/notification.module'
import { NotificationModuleModel } from '../notifications/notification.module'
import { NProfileModuleModel, type NProfileModule, type NProfileModuleSnapshotOut } from '../nprofile/nprofile.module'
import type { WelcomeModuleSnapshotOut } from '../welcome/welcome.module'

export type ModulesSnapshotOuts =
  | HomeModuleSnapshotOut
  | WelcomeModuleSnapshotOut
  | NotificationModuleSnapshotOut
  | NProfileModuleSnapshotOut
  | NEventModuleSnapshotOut

export type ModulesInstances = HomeModule | NotificationModule | NProfileModule | NEventModule

export const isHomeModule = (m: ModulesInstances): m is HomeModule => m.type === 'home'
export const isNProfileModule = (m: ModulesInstances): m is NProfileModule => m.type === 'nprofile'
export const isNEventModule = (m: ModulesInstances): m is NEventModule => m.type === 'nevent'
export const isNotificationModule = (m: ModulesInstances): m is NotificationModule => m.type === 'notification'

export const Modules = t.union(HomeModuleModel, NotificationModuleModel, NProfileModuleModel, NEventModuleModel)

export const ModuleStoreModel = t
  .model('ModuleStoreModel', {
    modules: t.map(Modules),
  })
  .actions((self) => ({
    add(module: ModulesInstances) {
      if (!self.modules.get(module.id)) {
        self.modules.set(module.id, module)
      }
    },
    get(id: string) {
      return self.modules.get(id)
    },
    delete(id: string) {
      self.modules.delete(id)
    },
  }))

export interface ModulesStore extends Instance<typeof ModuleStoreModel> {}
