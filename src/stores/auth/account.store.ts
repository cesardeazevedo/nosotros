import type { Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { NostrContextModel } from '../context/nostr.context.store'

export const AccountModel = t.model('AccountModel', {
  pubkey: t.identifier,
  context: t.late(() => NostrContextModel),
})

export interface Account extends Instance<typeof AccountModel> {}
export interface AccountSnapshotIn extends SnapshotIn<typeof AccountModel> {}
export interface AccountSnapshotOut extends SnapshotOut<typeof AccountModel> {}
