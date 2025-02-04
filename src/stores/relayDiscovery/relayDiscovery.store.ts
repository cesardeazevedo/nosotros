import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import { metadataSymbol, type NostrEventRelayDiscovery } from '@/nostr/types'
import { computed, makeAutoObservable } from 'mobx'
import { userRelayStore } from '../userRelays/userRelay.store'

class RelayDiscoveryStore {
  byMonitor = new Map<string, Map<string, NostrEventRelayDiscovery>>()
  monitors = new Set<string>()
  selectedMonitor = undefined as string | undefined

  limit = 20

  constructor() {
    makeAutoObservable(this, {
      sortedByLatency: computed.struct,
      sortedByPeople: computed.struct,
      list: computed.struct,
    })
  }

  get selected() {
    return this.selectedMonitor || this.firstMonitor
  }

  get firstMonitor(): string | undefined {
    return this.listMonitors[0]
  }

  get listMonitors() {
    return [...this.monitors.keys()]
  }

  get sortedByPeople() {
    return [...(this.getByMonitor(this.selected)?.values() || [])].toSorted((a, b) => {
      const relay1 = formatRelayUrl(a[metadataSymbol].tags?.['d']?.[0][1] || '')
      const relay2 = formatRelayUrl(b[metadataSymbol].tags?.['d']?.[0][1] || '')
      const users1 = userRelayStore.getPubkeysFromRelay(relay1)
      const users2 = userRelayStore.getPubkeysFromRelay(relay2)
      return users2.length - users1.length
    })
  }

  get sortedByLatency() {
    return [...(this.getByMonitor(this.selected)?.values() || [])].sort((a, b) => {
      const open1 = parseInt(a[metadataSymbol].tags?.['rtt-open']?.[0][1] || '0')
      const open2 = parseInt(b[metadataSymbol].tags?.['rtt-open']?.[0][1] || '0')
      return open2 - open1
    })
  }

  get list() {
    return this.sortedByPeople.slice(0, this.limit)
  }

  select(monitor: string) {
    this.selectedMonitor = monitor
  }

  paginate() {
    this.limit += this.limit
  }

  getId(event: NostrEventRelayDiscovery) {
    const d = event[metadataSymbol].tags.d?.[0][1]
    if (d) {
      return `${event.kind}:${event.pubkey}:${d}`
    }
  }

  getByMonitor(monitor: string | undefined) {
    return this.byMonitor.get(monitor || '')
  }

  add(event: NostrEventRelayDiscovery) {
    const id = this.getId(event)
    this.monitors.add(event.pubkey)
    if (id) {
      const data = this.getByMonitor(event.pubkey)
      if (data) {
        data.set(id, event)
      } else {
        this.byMonitor.set(event.pubkey, new Map([[id, event]]))
      }
    }
    return event
  }
}

export const relayDiscoveryStore = new RelayDiscoveryStore()
