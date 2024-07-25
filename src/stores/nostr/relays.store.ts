import type { Pool } from 'core/pool'
import type { Relay } from 'core/Relay'
import type { UserRelayDB } from 'db/types'
import type { ObservableMap } from 'mobx'
import { isObservable, makeAutoObservable, observable, values } from 'mobx'
import { trackUserRelays } from 'nostr/operators/trackUserRelays'
import { appState } from 'stores/app.state'
import { authStore } from 'stores/ui/auth.store'

class RelayStore {
  data = observable.map<string, UserRelayDB[]>({}, { deep: false })

  pool: Pool

  constructor() {
    makeAutoObservable(this, {
      list: false,
      others: false,
      myRelays: false,
      myConnectedRelays: false
    })

    this.pool = makeAutoObservable(appState.client.pool, undefined, { deep: true })

    const { pubkey } = authStore
    if (pubkey) {
      trackUserRelays(pubkey, { timeout: 8640000 }).subscribe((userRelays) => {
        this.add(pubkey, userRelays)
      })
    }
  }

  get myRelays() {
    const pubkey = authStore.pubkey
    if (pubkey) {
      return this.data.get(pubkey) || []
    }
    return []
  }

  get list() {
    return values(this.pool.relays as ObservableMap<string, Relay>).map((relay) => {
      //Watch properties from the actual relay class, since mobx won't deep observe class properties
      return isObservable(relay) ? relay : makeAutoObservable(relay)
    }) as Relay[]
  }

  get others() {
    const myRelays = new Set(this.myRelays.map((x) => x.relay))
    return this.list.filter((relay) => !myRelays.has(relay.url))
  }

  get connected() {
    return this.list.filter((relay) => relay.connected)
  }

  get unconnected() {
    return this.list.filter((relay) => !relay.connected)
  }

  get myConnectedRelays() {
    return this.myRelays.map((item) => this.pool.relays.get(item.relay)).filter((connected) => connected)
  }

  add(pubkey: string, userRelay: UserRelayDB[]) {
    this.data.set(pubkey, userRelay)
  }
}

export const relayStore = new RelayStore()
