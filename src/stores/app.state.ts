import { DEFAULT_RELAYS } from 'constants/relays'
import { NostrClient } from 'nostr/nostr'
import { pool } from 'nostr/pool'
import { router } from 'Router'
import { authStore } from './ui/auth.store'

class AppState {
  client: NostrClient

  constructor() {
    if (authStore.pubkey) {
      this.client = new NostrClient(pool, { pubkey: authStore.pubkey })
    } else {
      this.client = new NostrClient(pool, { relays: DEFAULT_RELAYS })
    }

    if (authStore.pubkey) {
      this.subscribeUser(authStore.pubkey)
    }

    authStore.on({
      onLogin: this.onLogin.bind(this),
      onLogout: this.onLogout.bind(this),
    })
  }

  onLogin(pubkey: string) {
    this.client = new NostrClient(pool, { pubkey })
    this.subscribeUser(pubkey)
    router.history.back()
  }

  onLogout() {}

  subscribeUser(pubkey: string) {
    this.client.users.subscribe([pubkey]).subscribe()
  }
}

export const appState = new AppState()
