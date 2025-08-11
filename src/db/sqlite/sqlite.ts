import type { RelayStatsDBMap } from '@/nostr/db/queryRelayStats'
import { parseEventMetadata } from '@/nostr/operators/parseEventMetadata'
import type { Filter, NostrEvent } from 'nostr-tools'
import type { Nip05DB, RelayInfoDB, RelayStatsDB } from '../types'
import type { NostrEventDB } from './sqlite.types'
import { type SqliteMessageResponse, type SqliteMessages } from './sqlite.types'

type Resolvers = {
  resolve: CallableFunction
  reject: CallableFunction
}

export class SqliteStorage {
  worker: Worker
  requests = new Map<string, Resolvers>()

  constructor() {
    this.requests = new Map()
    this.worker = new Worker(new URL('./sqlite.worker.ts', import.meta.url), { type: 'module' })
    this.worker.onmessage = (e) => {
      const res = JSON.parse(e.data) as SqliteMessageResponse<unknown> & { id: string }
      const resolvers = this.requests.get(res.id)
      if (resolvers) {
        this.requests.delete(res.id)
        if ('error' in res) {
          resolvers.reject(res.error)
        } else {
          resolvers.resolve(res.result)
        }
      }
    }
  }

  private async send<T = void>(msg: SqliteMessages) {
    return new Promise<T>((resolve, reject) => {
      const id = Math.random().toString().slice(2)
      this.requests.set(id, { resolve, reject })
      const data = JSON.stringify({ ...msg, id, sent: Date.now() })
      this.worker.postMessage(data)
    })
  }

  async queryEvents(filter: Filter) {
    const res = await this.send<NostrEventDB[]>({ method: 'queryEvent', params: filter })
    return res
  }

  async insertEvent(event: NostrEvent) {
    const exists = await this.send<string>({ method: 'exists', params: event })
    if (!exists) {
      const eventMetadata = parseEventMetadata(event)
      this.send({ method: 'insertEvent', params: eventMetadata })
      return eventMetadata
    }
  }

  async getRawEventById(id: string) {
    const res = await this.send<NostrEvent>({ method: 'getRawEventById', params: id })
    return res
  }

  async insertSeen(relay: string, event: NostrEvent) {
    await this.send({
      method: 'insertSeen',
      params: {
        relay,
        eventId: event.id,
        created_at: event.created_at,
      },
    })
  }

  async queryRelayStats(relays: string[]) {
    return await this.send<RelayStatsDBMap>({
      method: 'queryRelayStats',
      params: relays,
    })
  }

  async insertRelayStats(stat: RelayStatsDB) {
    return this.send<RelayStatsDB[]>({
      method: 'insertRelayStats',
      params: stat,
    })
  }

  async queryRelayInfo(relays: string[]) {
    return await this.send<RelayInfoDB[]>({
      method: 'queryRelayInfo',
      params: relays,
    })
  }

  async insertRelayInfo(stat: RelayInfoDB) {
    return this.send({
      method: 'insertRelayInfo',
      params: {
        url: stat.url,
        data: JSON.stringify(stat),
      },
    })
  }

  async queryNip05(handles: string[]) {
    return await this.send<Nip05DB>({
      method: 'queryNip05',
      params: handles,
    })
  }

  async insertNip05(nip05: Nip05DB) {
    return this.send({
      method: 'insertNip05',
      params: nip05,
    })
  }

  clearDB(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
