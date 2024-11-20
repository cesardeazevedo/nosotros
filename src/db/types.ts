import type { Kind } from 'constants/kinds'
import type { NostrEvent, NostrFilter } from 'core/types'

export interface SeenStore {
  query(eventId: string): Promise<SeenDB[]>
  countByRelay(relay: string): Promise<number>
  insertBulk(seens: SeenDB[]): Promise<void>
}

export interface EventStore {
  query(filters: NostrFilter | NostrFilter[]): AsyncGenerator<AsyncGenerator<NostrEvent, void, unknown>>
  queryByPubkey(kind: number, pubkey: string): Promise<NostrEvent | undefined>
  insert(event: NostrEvent): Promise<NostrEvent | false>
}

export interface RelayStatsStore {
  query(url: string): Promise<RelayStatsDB | undefined>
  insert(data: RelayStatsDB): Promise<RelayStatsDB>
}

export interface MetadataStore {
  query<T extends MetadataDB>(id: string): Promise<T | undefined>
  insert<T extends MetadataDB>(data: T): Promise<T>
}

export interface DB {
  seen: SeenStore
  event: EventStore
  relayStats: RelayStatsStore
  metadata: MetadataStore
  clearDB(): Promise<void>
}

export interface MetadataDB {
  id: string
  kind: number
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
  kind: Kind
  eventId: string
  relay: string
}

export interface RelayInfoDB {
  name: string
  description?: string
  pubkey?: string
  contact?: string
  supported_nips?: number[]
  software?: string
  version?: string
  payments_url?: string
  fees?: {
    [key: string]: Array<{
      kinds?: number[]
      amount: number
      unit: string
    }>
  }
  retention?: Array<{ kinds?: number[]; time?: number; count?: number }>
  limitation?: {
    max_message_length?: number
    max_subscriptions?: number
    max_filters?: number
    max_limit?: number
    max_subid_length?: number
    max_event_tags?: number
    max_content_length?: number
    min_pow_difficulty?: number
    auth_required?: boolean
    payment_required?: boolean
    restricted_writes?: boolean
    created_at_lower_limit?: number
    created_at_upper_limit?: number
  }
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
