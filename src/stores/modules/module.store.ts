import type { Instance } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { NProfileModuleModel, type NProfileModule } from '../nprofile/nprofile.module'
import { RelayFeedModuleModel, type RelayFeedModule } from '../relays/relay.feed.module'
import type { HomeModule } from './home.module'
import { HomeModuleModel } from './home.module'
import { MediaModuleModel, type MediaModule } from './media.module'
import { NAddressModuleModel, type NAddressModule } from './naddress.module'
import { NEventModuleModel, type NEventModule } from './nevent.module'
import type { NotificationModule } from './notification.module'
import { NotificationModuleModel } from './notification.module'
import type { TagModule } from './tag.module'
import { TagModuleModel } from './tag.module'

export type ModulesInstances =
  | HomeModule
  | NotificationModule
  | NProfileModule
  | NEventModule
  | NAddressModule
  | TagModule
  | RelayFeedModule
  | MediaModule

export const isHomeModule = (m: ModulesInstances): m is HomeModule => m.type === 'home'
export const isNProfileModule = (m: ModulesInstances): m is NProfileModule => m.type === 'nprofile'
export const isNEventModule = (m: ModulesInstances): m is NEventModule => m.type === 'nevent'
export const isNAddressModule = (m: ModulesInstances): m is NAddressModule => m.type === 'naddress'
export const isNotificationModule = (m: ModulesInstances): m is NotificationModule => m.type === 'notification'
export const isRelayFeedModule = (m: ModulesInstances): m is RelayFeedModule => m.type === 'relayfeed'
export const isTagModule = (m: ModulesInstances): m is TagModule => m.type === 'tag'
export const isMediaModule = (m: ModulesInstances): m is MediaModule => m.type === 'media'

export const Modules = t.union(
  HomeModuleModel,
  NotificationModuleModel,
  NProfileModuleModel,
  NEventModuleModel,
  NAddressModuleModel,
  RelayFeedModuleModel,
  MediaModuleModel,
  TagModuleModel,
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
