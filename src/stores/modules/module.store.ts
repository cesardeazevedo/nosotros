import type { Instance } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import type { HomeModule } from '../home/home.module'
import { HomeModuleModel } from '../home/home.module'
import { NAddressModuleModel, type NAddressModule } from '../naddress/naddress.module'
import { NEventModuleModel, type NEventModule } from '../nevent/nevent.module'
import type { NotificationModule } from '../notifications/notification.module'
import { NotificationModuleModel } from '../notifications/notification.module'
import { NProfileModuleModel, type NProfileModule } from '../nprofile/nprofile.module'

export type ModulesInstances = HomeModule | NotificationModule | NProfileModule | NEventModule | NAddressModule

export const isHomeModule = (m: ModulesInstances): m is HomeModule => m.type === 'home'
export const isNProfileModule = (m: ModulesInstances): m is NProfileModule => m.type === 'nprofile'
export const isNEventModule = (m: ModulesInstances): m is NEventModule => m.type === 'nevent'
export const isNAddressModule = (m: ModulesInstances): m is NAddressModule => m.type === 'naddress'
export const isNotificationModule = (m: ModulesInstances): m is NotificationModule => m.type === 'notification'

export const Modules = t.union(
  HomeModuleModel,
  NotificationModuleModel,
  NProfileModuleModel,
  NEventModuleModel,
  NAddressModuleModel,
)

export const ModuleStoreModel = t
  .model('ModuleStoreModel', {
    modules: t.map(Modules),
  })
  .actions((self) => ({
    add<T extends ModulesInstances>(module: T): T {
      const found = self.modules.get(module.id) as T
      if (!found) {
        self.modules.set(module.id, module)
        return module
      }
      return found
    },
    get<T extends ModulesInstances>(id: string): T | undefined {
      return self.modules.get(id) as T | undefined
    },
    delete(id: string) {
      self.modules.delete(id)
    },
  }))

export interface ModulesStore extends Instance<typeof ModuleStoreModel> {}
