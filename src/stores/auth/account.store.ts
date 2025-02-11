import type { Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { NostrStoreModel } from '../nostr/nostr.context.store'

export const AccountModel = t.model('AccountModel', {
  pubkey: t.identifier,
  context: t.late(() => NostrStoreModel),
})

export interface Account extends Instance<typeof AccountModel> {}
export interface AccountSnapshotIn extends SnapshotIn<typeof AccountModel> {}
export interface AccountSnapshotOut extends SnapshotOut<typeof AccountModel> {}
