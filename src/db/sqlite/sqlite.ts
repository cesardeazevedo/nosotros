import { parseEventMetadata } from '@/hooks/parsers/parseEventMetadata'
import { getDTag } from '@/utils/nip19'
import type { Filter, NostrEvent } from 'nostr-tools'
import { isAddressableKind, isReplaceableKind } from 'nostr-tools/kinds'
import type { Nip05DB, RelayInfoDB, RelayStatsDB, SeenDB, UserDB } from '../types'
import { SqliteSharedService } from './sqlite.shared'
import type { NostrEventDB, NostrEventExists } from './sqlite.types'
import { type SqliteMessages } from './sqlite.types'

export class SqliteStorage {
  private service = new SqliteSharedService()

  private async send<T = void>(msg: SqliteMessages) {
    return this.service.send<T>(msg)
  }

  async queryEvents(filter: Filter) {
    return await this.send<NostrEventDB[]>({ method: 'queryEvent', params: filter })
  }

  async queryNeg(filter: Filter) {
    return await this.send<NostrEventExists[]>({ method: 'queryNeg', params: filter })
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

  async deleteEvent(eventId: string) {
    this.send({ method: 'deleteEvent', params: eventId })
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

  async queryTags(tag: string, query?: string, limit = 100) {
    return await this.send<string[]>({
      method: 'queryTags',
      params: { tag, query, limit },
    })
  }

  async queryUsers(prefix: string, limit = 20) {
    return await this.send<UserDB[]>({
      method: 'queryUsers',
      params: { prefix, limit },
    })
  }

  async upsertUser(user: UserDB) {
    return this.send({ method: 'upsertUser', params: user })
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
