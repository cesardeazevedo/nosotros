import type { Kind } from 'constants/kinds'
import type { NostrEvent, NostrFilter } from 'core/types'
import type { RelayInformation } from 'nostr-tools/nip11'

export interface SeenStore {
  query(eventId: string): Promise<SeenDB[]>
  countByRelay(relay: string): Promise<number>
  insertBulk(seens: SeenDB[]): Promise<void>
}

export interface EventStore {
  query(filters: NostrFilter | NostrFilter[]): AsyncGenerator<NostrEvent, void, unknown>
  queryByPubkey(kind: number, pubkey: string): Promise<NostrEvent | undefined>
  insert(event: NostrEvent): Promise<NostrEvent | false>
}

export interface RelayStatsStore {
  query(url: string): Promise<RelayStatsDB | undefined>
  queryAll(): Promise<RelayStatsDB[] | undefined>
  insert(data: RelayStatsDB): Promise<RelayStatsDB>
}

export interface RelayInfoStore {
  query(url: string): Promise<RelayInfoDB | undefined>
  queryAll(): Promise<RelayInfoDB[] | undefined>
  insert(url: string, data: RelayInfoDB): Promise<RelayInfoDB>
}

export interface DB {
  seen: SeenStore
  event: EventStore
  relayStats: RelayStatsStore
  relayInfo: RelayInfoStore
  clearDB(): Promise<void>
}

export interface MetadataDB {
  id: string
  kind: Kind
}

export interface TagDB {
  kind: NostrEvent['kind']
  eventId: string
  created_at: number
  pubkey: string
  index: number
  tag: string
  value: string
  extras: unknown[]
}

export interface SeenDB {
  eventId: string
  relay: string
  created_at: number
}

export interface RelayInfoDB extends RelayInformation {
  url: string
  timestamp: number
}

export interface RelayStatsDB {
  url: string
  auths: number
  connects: number
  closes: number
  events: number
  eoses: number
  notices: string[]
  subscriptions: number
  publishes: number
  errors: number
  errorMessages: string[]
  lastAuth: number
  lastConnected: number
}

export interface Nip05DB {
  nip05: string
  pubkey: string
  relays: string[]
  timestamp: number
}

export type Nip05Stored = Nip05DB & {
  relays: string
}

export interface UserDB {
  pubkey: string
  name: string
  display_name?: string
}
