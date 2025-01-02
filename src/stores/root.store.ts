import { APP_STORAGE_KEY } from '@/constants/app'
import { reactotron } from '@/ReactotronConfig'
import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { applySnapshot, onSnapshot, t } from 'mobx-state-tree'
import { AuthStoreModel } from './auth/auth.store'
import { NostrContextModel } from './context/nostr.context.store'
import { NostrSettingsModel } from './context/nostr.settings.store'
import { DeckStoreModel } from './deck/deck.store'
import { initialState } from './helpers/initialState'
import { storage } from './persisted/storage'
import { GlobalSettingsModel } from './settings/settings.global.store'
import { WelcomeModuleModel } from './welcome/welcome.module'

export const RootStoreModel = t.model('RootStoreModel', {
  auth: AuthStoreModel,
  decks: DeckStoreModel,

  defaultContext: NostrContextModel,
  nostrSettings: NostrSettingsModel,
  globalSettings: GlobalSettingsModel,

  welcome: WelcomeModuleModel,
})

const RootStoreViewsModel = RootStoreModel.views((self) => ({
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
reactotron.trackMstNode(rootStore)

onSnapshot(rootStore, (snapshot) => {
  storage.setItem(APP_STORAGE_KEY, snapshot)
})

export interface RootStore extends Instance<typeof RootStoreModel> {}
export interface RootStoreSnapshotIn extends SnapshotIn<typeof RootStoreModel> {}
