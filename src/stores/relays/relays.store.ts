import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import type { RelayInfoDB, RelayStatsDB } from '@/db/types'
import { computed, makeAutoObservable } from 'mobx'
import type { NostrEvent } from 'nostr-tools'
import type { RelayStore } from './relay'
import { createRelayStore } from './relay'

export const relaysStore = makeAutoObservable(
  {
    relays: new Map<string, RelayStore>(),
    auths: new Map<string, string>(),

    // Special data for nip11 that from relay monitors
    infosFromMonitors: new Map<string, RelayInfoDB>(),

    add(url: string, stats?: RelayStatsDB) {
      const relay = this.relays.get(formatRelayUrl(url))
      if (!relay) {
        const newRelay = createRelayStore(url, stats)
        this.relays.set(newRelay.url, newRelay)
        return newRelay
      }
      return relay
    },

    addInfo(info: RelayInfoDB) {
      const relay = this.add(info.url)
      relay.addInfo(info)
      return relay
    },

    addInfoFromDiscovery(url: string, event: NostrEvent) {
      try {
        const data = JSON.parse(event.content || '{}') as RelayInfoDB
        this.infosFromMonitors.set(formatRelayUrl(url), data)
      } catch (error) {
        console.log(error)
      }
    },

    addAuth(url: string, challenge: string) {
      this.auths.set(url, challenge)
      this.getByUrl(url)?.increment('auths')
    },

    removeAuth(url: string) {
      this.auths.delete(url)
    },

    getInfo(url: string | undefined) {
      return this.getByUrl(url)?.info || this.infosFromMonitors.get(formatRelayUrl(url))
    },

    getByUrl(url: string | undefined) {
      return this.relays.get(formatRelayUrl(url))
    },

    select(config: { excluded?: Set<string> }) {
      return this.list.filter((relay) => !config.excluded?.has(relay.url))
    },

    get list(): RelayStore[] {
      return Array.from(this.relays.values())
    },

    get connected(): RelayStore[] {
      return this.list.filter((relay: RelayStore) => relay.connected)
    },

    get disconnected(): RelayStore[] {
      return this.list.filter((relay: RelayStore) => !relay.connected)
    },
  },
  {
    list: computed.struct,
    connected: computed.struct,
    disconnected: computed.struct,
  },
  {
    autoBind: true,
  },
)
