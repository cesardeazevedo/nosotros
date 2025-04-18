import { formatRelayUrl, prettyRelayUrl } from '@/core/helpers/formatRelayUrl'
import type { RelayInfoDB, RelayStatsDB } from '@/db/types'
import { db } from '@/nostr/db'
import { autorun, makeAutoObservable, toJS } from 'mobx'

export type RelayStore = ReturnType<typeof createRelayStore>

export const createRelayStore = (url: string, stats?: RelayStatsDB) => {
  const state = makeAutoObservable({
    url: formatRelayUrl(url),
    connected: false,
    latency: 0,
    latencies: [] as number[],

    stats: (stats || {
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
    }) as Omit<RelayStatsDB, 'url'>,

    info: undefined as RelayInfoDB | undefined,

    get pretty() {
      return prettyRelayUrl(this.url)
    },

    connect() {
      this.stats.connects++
      this.connected = true
      this.stats.lastConnected = Date.now() / 1000
    },

    disconnect() {
      this.stats.closes++
      this.connected = false
    },

    increment(field: keyof Pick<RelayStatsDB, 'connects' | 'events' | 'eoses' | 'auths'>) {
      this.stats[field]++
    },

    addNotice(message: string) {
      this.stats.notices.push(message)
      this.stats.notices = this.stats.notices.slice(0, 20)
    },

    addError(message: string) {
      this.stats.errors = 0
      this.stats.errorMessages.push(message)
    },

    addInfo(info: RelayInfoDB) {
      this.info = info
    },
  })

  autorun(
    async () => {
      const stats = toJS(state.stats)
      const events = await db.seen.countByRelay(state.url)
      db.relayStats.insert({ ...stats, events, url: state.url })
    },
    { delay: 7500 },
  )

  return state
}
