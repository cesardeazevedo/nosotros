import { DEFAULT_RELAYS } from 'constants/relays'
import { NIP07Signer } from 'core/signers/nip07.signer'
import { NostrClient } from 'nostr/nostr'
import { pool } from 'nostr/pool'
import { router } from 'Router'
import type { Account } from './ui/auth.store'
import { authStore } from './ui/auth.store'

class AppState {
  client!: NostrClient

  constructor() {
    this.setClient(authStore.currentAccount)

    authStore.on({
      onLogin: this.onLogin.bind(this),
      onLogout: this.onLogout.bind(this),
    })
  }

  setClient(account?: Account) {
    if (account) {
      const pubkey = account.pubkey
      const signer = account.signer === 'nip07' ? new NIP07Signer() : undefined
      this.client = new NostrClient(pool, { pubkey, signer })
      this.subscribeUser(pubkey)
    } else {
      this.client = new NostrClient(pool, { relays: DEFAULT_RELAYS })
    }
  }

  onLogin(account: Account) {
    this.setClient(account)
    router.history.back()
  }

  onLogout() {
    this.setClient()
  }

  subscribeUser(pubkey: string) {
    this.client.users.subscribe([pubkey]).subscribe()
  }
}

export const appState = new AppState()
