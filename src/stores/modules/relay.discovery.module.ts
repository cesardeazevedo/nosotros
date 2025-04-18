import { Kind } from '@/constants/kinds'
import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import { observable } from 'mobx'
import type { Instance } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import type { NostrEvent } from 'nostr-tools'
import { startTransition } from 'react'
import { eventStore } from '../events/event.store'
import { FeedStoreModel } from '../feeds/feed.store'
import { BaseModuleModel } from './base.module'

export const RelayDiscoveryModuleModel = BaseModuleModel.named('RelayDiscoveryModuleModel')
  .props({
    type: t.optional(t.literal('relaydiscovery'), 'relaydiscovery'),
    feed: FeedStoreModel,
    selectedMonitor: t.maybe(t.string),
  })
  .volatile(() => ({
    query: '',
    sorted: false,
    seenMonitors: observable.set<string>(),
  }))
  .views((self) => ({
    get selected() {
      return self.selectedMonitor || this.firstMonitor
    },

    get firstMonitor(): string | undefined {
      return [...self.seenMonitors].sort((a, b) => {
        const total1 = eventStore.getIdsByKindPubkey(Kind.RelayDiscovery, a)?.size || 0
        const total2 = eventStore.getIdsByKindPubkey(Kind.RelayDiscovery, b)?.size || 0
        return total2 - total1
      })?.[0]
    },

    get filtered() {
      return this.current.filter((x) => x.getTag('d')?.toLowerCase().indexOf(self.query.toLowerCase()) !== -1)
    },

    get sortedByUsers() {
      return this.filtered.toSorted((a, b) => {
        const relay1 = formatRelayUrl(a.getTag('d'))
        const relay2 = formatRelayUrl(b.getTag('d'))
        const users1 = eventStore.getPubkeysByKindTagValue(Kind.RelayList, 'r', relay1)?.size || 0
        const users2 = eventStore.getPubkeysByKindTagValue(Kind.RelayList, 'r', relay2)?.size || 0
        return users2 - users1
      })
    },

    get list() {
      return (self.sorted ? this.sortedByUsers : this.filtered).slice(0, self.feed.chunk)
    },

    get left() {
      return Math.max(0, this.current.length - self.feed.chunk)
    },

    get listMonitors() {
      return [...self.seenMonitors]
    },

    get current() {
      return this.getByMonitor(this.selected)
    },

    getByMonitor(monitor: string | undefined) {
      return [...(eventStore.getEventsByKindPubkey(Kind.RelayDiscovery, monitor).values() || [])]
    },

    getTotal(monitor: string | undefined) {
      return this.getByMonitor(monitor).length
    },
  }))
  .actions((self) => ({
    add(event: NostrEvent) {
      self.seenMonitors.add(event.pubkey)
    },

    select(monitor: string) {
      self.selectedMonitor = monitor
    },

    toggleSorted() {
      self.sorted = !self.sorted
    },

    setQuery(query: string) {
      startTransition(() => {
        self.query = query
      })
    },
  }))

export interface RelayDiscoveryModule extends Instance<typeof RelayDiscoveryModuleModel> {}
