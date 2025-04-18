import { APP_STORAGE_KEY } from '@/constants/app'
import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { applySnapshot, onSnapshot, t } from 'mobx-state-tree'
import { AuthStoreModel } from './auth/auth.store'
import { DeckStoreModel } from './deck/deck.store'
import { initialState } from './helpers/initialState'
import { NostrContextModel } from './nostr/nostr.context.model'
import { storage } from './persisted/storage'
import { RecentsModel } from './recents/recents.store'
import { GlobalSettingsModel } from './settings/settings.global.store'

export const RootStoreModel = t.model('RootStoreModel', {
  auth: AuthStoreModel,
  decks: DeckStoreModel,
  recents: RecentsModel,

  globalContext: NostrContextModel,
  globalSettings: GlobalSettingsModel,
})

export const RootStoreViewsModel = RootStoreModel.actions((self) => ({
  reset() {
    applySnapshot(self, initialState)
  },
}))

export const rootStore = RootStoreViewsModel.create(initialState)

const snapshot = storage.getItem(APP_STORAGE_KEY)
if (RootStoreViewsModel.is(snapshot)) {
  applySnapshot(rootStore, snapshot)
}

onSnapshot(rootStore, (snapshot) => {
  storage.setItem(APP_STORAGE_KEY, snapshot)
})

export interface RootStore extends Instance<typeof RootStoreModel> {}
export interface RootStoreSnapshotIn extends SnapshotIn<typeof RootStoreModel> {}
