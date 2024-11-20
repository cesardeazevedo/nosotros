import type { RelayStatsDB } from '@/db/types'
import { makeAutoObservable, observable } from 'mobx'
import { RelayStore } from './relay.store'
import { userRelayStore } from './userRelay.store'

class RelaysStore {
  relays = observable.map<string, RelayStore>()

  constructor() {
    makeAutoObservable(this)
  }

  add(url: string, stats?: RelayStatsDB) {
    const relay = this.relays.get(url)
    if (!relay) {
      const newRelay = new RelayStore(url, stats)
      this.relays.set(url, newRelay)
      return newRelay
    }
    return relay
  }

  getByUrl(url: string) {
    return this.relays.get(url)
  }

  select(config: { excluded?: Set<string> }) {
    return this.list.filter((relay) => !config.excluded?.has(relay.url))
  }

  get list() {
    return Array.from(this.relays.values())
  }

  get connected() {
    return this.list.filter((relay) => relay.connected)
  }

  get disconnected() {
    return this.list.filter((relay) => !relay.connected)
  }

  /**
   * Returns a relay list excluding the relay list by the given pubkey
   */
  difference(pubkey?: string) {
    if (pubkey) {
      const pubkeyRelays = userRelayStore.getRelays(pubkey)
      const excluded = new Set(pubkeyRelays)
      return this.select({ excluded })
    }
    return this.list
  }
}

export const relaysStore = new RelaysStore()
