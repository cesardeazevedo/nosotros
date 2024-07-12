import type { UserRelayDB } from 'db/types'
import { makeAutoObservable, observable } from 'mobx'
import { authStore } from 'stores/ui/auth.store'

class RelayStore {
  userRelays = observable.map<string, UserRelayDB[]>({}, { deep: false })

  constructor() {
    makeAutoObservable(this)
  }

  get myRelays() {
    const pubkey = authStore.currentUser?.data.pubkey
    if (pubkey) {
      return this.userRelays.get(pubkey) || []
    }
    return []
  }

  get myConnectedRelays() {
    return []
  }

  add(pubkey: string, userRelay: UserRelayDB[]) {
    this.userRelays.set(pubkey, userRelay)
  }
}

export const relayStore = new RelayStore()
