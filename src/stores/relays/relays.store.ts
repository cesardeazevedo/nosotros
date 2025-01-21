import type { RelayStatsDB } from '@/db/types'
import { makeAutoObservable } from 'mobx'
import { userRelayStore } from '../userRelays/userRelay.store'
import type { RelayStore } from './relay'
import { createRelayStore } from './relay'

export const relaysStore = makeAutoObservable(
  {
    relays: new Map<string, RelayStore>(),

    add(url: string, stats?: RelayStatsDB) {
      const relay = this.relays.get(url)
      if (!relay) {
        const newRelay = createRelayStore(url, stats)
        this.relays.set(url, newRelay)
        return newRelay
      }
      return relay
    },

    getByUrl(url: string) {
      return this.relays.get(url)
    },

    select(config: { excluded?: Set<string> }) {
      return this.list.filter((relay) => !config.excluded?.has(relay.url))
    },

    get list(): RelayStore[] {
      return Array.from(this.relays.values())
    },

    get connected() {
      return this.list.filter((relay: RelayStore) => relay.connected)
    },

    get disconnected() {
      return this.list.filter((relay: RelayStore) => !relay.connected)
    },

    /**
     * Returns a relay list excluding the relay list by the given pubkey
     * TODO: wrap in a computedFn
     */
    difference(pubkey?: string) {
      if (pubkey) {
        const pubkeyRelays = userRelayStore.getRelays(pubkey)
        const excluded = new Set(pubkeyRelays)
        return this.select({ excluded })
      }
      return this.list
    },
  },
  {},
  {
    autoBind: true,
  },
)
