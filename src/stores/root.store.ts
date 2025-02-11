import { APP_STORAGE_KEY } from '@/constants/app'
import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { applySnapshot, onSnapshot, t } from 'mobx-state-tree'
import { AuthStoreModel } from './auth/auth.store'
import { NostrStoreModel } from './nostr/nostr.context.store'
import { NostrSettingsModel } from './nostr/nostr.settings.store'
import { DeckStoreModel } from './deck/deck.store'
import { initialState } from './helpers/initialState'
import { ModuleStoreModel } from './modules/module.store'
import { storage } from './persisted/storage'
import { GlobalSettingsModel } from './settings/settings.global.store'

export const RootStoreModel = t.model('RootStoreModel', {
  auth: AuthStoreModel,
  decks: DeckStoreModel,

  defaultContext: NostrStoreModel,
  nostrSettings: NostrSettingsModel,
  globalSettings: GlobalSettingsModel,

  tempModules: t.snapshotProcessor(ModuleStoreModel, { postProcessor: () => ({}) }),
  persistedModules: ModuleStoreModel,
})

export const RootStoreViewsModel = RootStoreModel.views((self) => ({
  get rootContext() {
    return self.auth.selected?.context || self.defaultContext
  },
}))

export const rootStore = RootStoreViewsModel.create({
  ...initialState,
})

const snapshot = storage.getItem(APP_STORAGE_KEY)
if (RootStoreViewsModel.is(snapshot)) {
  applySnapshot(rootStore, snapshot)
}

// @ts-ignore
onSnapshot(rootStore, (snapshot) => {
  storage.setItem(APP_STORAGE_KEY, snapshot)
})

export const modules = ModuleStoreModel.create({})

export interface RootStore extends Instance<typeof RootStoreModel> {}
export interface RootStoreSnapshotIn extends SnapshotIn<typeof RootStoreModel> {}
