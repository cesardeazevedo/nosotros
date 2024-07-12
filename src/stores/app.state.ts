import { NostrClient } from "nostr/nostr"
import { authStore } from "./ui/auth.store"
import { DEFAULT_RELAYS } from "constants/relays"
import { router } from "Router"

class AppState {
  client: NostrClient

  constructor() {

    if (authStore.pubkey) {
      this.client = new NostrClient({ pubkey: authStore.pubkey })
    } else {
      this.client = new NostrClient({ relays: DEFAULT_RELAYS })
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
    this.client = new NostrClient({ pubkey })
    this.subscribeUser(pubkey)
    router.history.back()
  }

  onLogout() { }

  subscribeUser(pubkey: string) {
    this.client.users.subscribe([pubkey]).subscribe()
  }
}

export const appState = new AppState()
