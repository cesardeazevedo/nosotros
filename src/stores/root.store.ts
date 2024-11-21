import { DEFAULT_RELAYS } from 'constants/relays'
import { NIP07Signer } from 'core/signers/nip07.signer'
import { makeAutoObservable } from 'mobx'
import type { NostrClientOptions } from 'nostr/nostr'
import { authStore, type Account } from './ui/auth.store'
import { NostrContext } from './ui/nostr.context'
import { settingsStore } from './ui/settings.store'

class RootStore {
  rootContext: NostrContext

  constructor() {
    this.rootContext = new NostrContext(this.getContextOptions(authStore.currentAccount))

    authStore.on({
      onLogin: this.onLogin.bind(this),
      onLogout: this.onLogout.bind(this),
    })

    makeAutoObservable(this)
  }

  getContextOptions(account?: Account): NostrClientOptions {
    const settings = settingsStore.nostrSettings
    if (account) {
      const pubkey = account.pubkey
      const signer = account.signer === 'nip07' ? new NIP07Signer() : undefined
      return { pubkey, signer, settings }
    } else {
      return { relays: DEFAULT_RELAYS, settings }
    }
  }

  onLogin(account: Account) {
    this.rootContext.setClient(this.getContextOptions(account))
  }

  onLogout() {
    this.rootContext.setClient(this.getContextOptions())
  }
}

export const rootStore = new RootStore()
