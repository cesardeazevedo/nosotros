import { t } from 'mobx-state-tree'
import invariant from 'tiny-invariant'
import { userStore } from '../users/users.store'
import type { Account, AccountSnapshotIn } from './account.store'
import { AccountModel } from './account.store'

export const AuthStoreModel = t
  .model('AuthStoreModel', {
    selected: t.maybe(t.reference(AccountModel)),
    accounts: t.map(AccountModel),
  })
  .views((self) => ({
    get pubkey() {
      return self.selected?.pubkey
    },

    get currentUser() {
      return userStore.get(this.pubkey)
    },
  }))
  .actions((self) => ({
    reset() {
      self.accounts.clear()
      self.selected = undefined
    },

    create(snapshot: AccountSnapshotIn) {
      const account = AccountModel.create(snapshot)
      self.accounts.set(account.pubkey, account)
      return account
    },

    select(account: Account) {
      if (self.accounts.has(account.pubkey)) {
        self.selected = account
      }
    },

    delete(pubkey: string) {
      self.accounts.delete(pubkey)
    },
  }))
  .actions((self) => ({
    login(snapshot: AccountSnapshotIn) {
      const account = self.create(snapshot)
      self.select(account)
    },

    logout() {
      invariant(self.pubkey, 'Pubkey not present during logout')
      self.delete(self.pubkey)
      self.selected = undefined
    },
  }))
