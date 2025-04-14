import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { SignersModel } from '../signers/signers'

export const AccountModel = t
  .model('AccountModel', {
    pubkey: t.identifier,
    signer: t.maybe(SignersModel),
    lastSeen: t.optional(
      t.model({
        notification: t.maybe(t.number),
        messages: t.map(
          t.model({
            pubkey: t.identifier,
            lastSeen: t.number,
          }),
        ),
      }),
      { notification: undefined, messages: {} },
    ),
  })
  .actions((self) => ({
    setLastSeenNotification(date: number) {
      self.lastSeen.notification = Math.max(self.lastSeen.notification || 0, date)
    },
  }))

export interface Account extends Instance<typeof AccountModel> {}
export interface AccountSnapshotIn extends SnapshotIn<typeof AccountModel> {}
