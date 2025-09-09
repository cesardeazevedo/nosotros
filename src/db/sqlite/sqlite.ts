import { parseEventMetadata } from '@/hooks/parsers/parseEventMetadata'
import { getDTag } from '@/utils/nip19'
import type { Filter, NostrEvent } from 'nostr-tools'
import { isAddressableKind, isReplaceableKind } from 'nostr-tools/kinds'
import type { Nip05DB, RelayInfoDB, RelayStatsDB, SeenDB } from '../types'
import type { NostrEventDB, NostrEventExists } from './sqlite.types'
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
      const raw = e.data
      const res = (typeof raw === 'string' ? JSON.parse(raw) : raw) as SqliteMessageResponse<unknown> & { id: string }
      const resolvers = this.requests.get(res.id)
      if (!resolvers) {
        return
      }
      this.requests.delete(res.id)
      if ('error' in res) {
        resolvers.reject(res.error)
      } else {
        resolvers.resolve(res.result)
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
    return await this.send<NostrEventDB[]>({ method: 'queryEvent', params: filter })
  }

  async exists(event: NostrEvent) {
    if (isReplaceableKind(event.kind)) {
      return await this.send<NostrEventExists>({ method: 'existsReplaceable', params: [event.kind, event.pubkey] })
    } else if (isAddressableKind(event.kind)) {
      const dTag = getDTag(event)
      if (dTag) {
        return await this.send<NostrEventExists>({
          method: 'existsAddressable',
          params: [event.kind, event.pubkey, dTag],
        })
      }
    }
    return await this.send<NostrEventExists>({ method: 'exists', params: event.id })
  }

  async insertEvent(event: NostrEvent) {
    const eventMetadata = parseEventMetadata(event)
    this.send({ method: 'insertEvent', params: eventMetadata })
    return eventMetadata
  }

  async querySeen(eventId: string) {
    return await this.send<SeenDB[]>({
      method: 'querySeen',
      params: eventId,
    })
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
    return await this.send<RelayStatsDB[]>({
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
    return await this.send<Nip05DB[]>({
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

  async countEvents() {
    return this.send<number>({ method: 'countEvents' })
  }

  async countTags() {
    return this.send<number>({ method: 'countTags' })
  }

  async dbSizeBytes() {
    return this.send<number>({ method: 'dbSize ' })
  }

  async exportDB() {
    return await this.send<Uint8Array<ArrayBufferLike>>({ method: 'exportDB' })
  }

  async deleteDB() {
    await this.send({ method: 'deleteDB' })
  }
}
