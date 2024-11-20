import type { RelayStatsDB } from '@/db/types'
import { db } from '@/nostr/db'
import { autorun, makeAutoObservable, toJS } from 'mobx'
import type { RelayInformation } from 'nostr-tools/lib/types/nip11'

export class RelayStore {
  url: string

  // connectivity
  connected = false
  latency = 0
  latencies = []

  stats: Omit<RelayStatsDB, 'url'> = {
    connects: 0,
    closes: 0,
    events: 0,
    eoses: 0,
    notices: [],
    auths: 0,
    errors: 0,
    errorMessages: [],
    subscriptions: 0,
    publishes: 0,
    lastAuth: 0,
    lastConnected: 0,
  }

  info: RelayInformation | undefined

  constructor(url: string, stats?: RelayStatsDB) {
    makeAutoObservable(this)

    this.url = url

    if (stats) {
      this.stats = stats
    }

    autorun(
      async () => {
        const stats = toJS(this.stats)
        const events = await db.seen.countByRelay(this.url)
        db.relayStats.insert({ ...stats, events, url: this.url })
      },
      { delay: 5000 },
    )
  }

  connect() {
    this.stats.connects++
    this.connected = true
  }

  disconnect() {
    this.stats.closes++
    this.connected = false
  }

  increment(field: keyof Pick<RelayStatsDB, 'connects' | 'events' | 'eoses' | 'auths'>) {
    this.stats[field]++
  }

  addNotice(message: string) {
    this.stats.notices.push(message)
    this.stats.notices = this.stats.notices.slice(0, 20)
  }

  addError(message: string) {
    this.stats.errors = 0
    this.stats.errorMessages.push(message)
  }

  addInfo(info: RelayInformation) {
    this.info = info
  }
}
