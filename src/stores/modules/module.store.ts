import type { Instance } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import type { FeedModule } from './feed.module'
import { FeedModuleModel } from './feed.module'
import type { HomeModule } from './home.module'
import { HomeModuleModel } from './home.module'
import { MediaModuleModel, type MediaModule } from './media.module'
import { NostrModuleModule, type NostrModule } from './nostr.module'
import { NProfileModuleModel, type NProfileModule } from './nprofile.module'
import { RelayDiscoveryModuleModel, type RelayDiscoveryModule } from './relay.discovery.module'

export type ModulesInstances =
  | HomeModule
  | FeedModule
  | NProfileModule
  | RelayDiscoveryModule
  | MediaModule
  | NostrModule

export const isHomeModule = (m: ModulesInstances): m is HomeModule => m.type === 'home'
export const isFeedModule = (m: ModulesInstances): m is FeedModule => m.type === 'feed'
export const isNostrModule = (m: ModulesInstances): m is NostrModule => m.type === 'event'
export const isNProfileModule = (m: ModulesInstances): m is NProfileModule => m.type === 'nprofile'
export const isNotificationModule = (m: ModulesInstances): m is FeedModule => m.type === 'notifications'
export const isRelayDiscoveryModule = (m: ModulesInstances): m is RelayDiscoveryModule => m.type === 'relaydiscovery'
export const isMediaModule = (m: ModulesInstances): m is MediaModule => m.type === 'media'

export const Modules = t.union(
  HomeModuleModel,
  NProfileModuleModel,
  NostrModuleModule,
  MediaModuleModel,
  RelayDiscoveryModuleModel,
  FeedModuleModel,
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
    clear() {
      self.modules.clear()
    },
  }))

export interface ModulesStore extends Instance<typeof ModuleStoreModel> {}
