import type { NostrEvent } from '@/core/types'
import type { Kind } from 'constants/kinds'
import type { MetadataDB, Nip05DB, RelayInfoDB, RelayStatsDB, SeenDB, TagDB } from 'db/types'
import type { DBSchema } from 'idb'

export interface IndexedDBSchema extends DBSchema {
  events: {
    key: string
    value: NostrEvent
    indexes: {
      kind_pubkey_created_at: [kind: Kind, pubkey: string, created_at: number]
    }
  }
  tags: {
    key: [eventId: string, tag: string, value: string]
    value: TagDB
    indexes: {
      kind_tag_value_created_at: [kind: Kind, tag: string, value: string, created_at: number]
    }
  }
  metadata: {
    key: string
    value: MetadataDB
  }
  seen: {
    key: [eventId: string, relay: string]
    value: SeenDB
    indexes: {
      eventId: string
      relay: string
    }
  }
  relayInfo: {
    key: string
    value: RelayInfoDB
  }
  relayStats: {
    key: string
    value: RelayStatsDB
  }
  nip05: {
    key: string
    value: {
      nip05: string
      pubkey: string
      relays: string[]
      timestamp: number
    }
  }
}

interface Schema<T> {
  name: string
  keyPath?: keyof T | Array<keyof T>
  indexes: Array<{
    name?: string
    keyPath: keyof T | Array<keyof T>
    options?: {
      unique?: boolean
      multiEntry?: boolean
    }
  }>
}

const events = {
  name: 'events' as const,
  keyPath: 'id',
  indexes: [{ keyPath: ['kind', 'pubkey', 'created_at'], name: 'kind_pubkey_created_at' }],
} satisfies Schema<NostrEvent>

const tags = {
  name: 'tags' as const,
  keyPath: ['eventId', 'tag', 'value'],
  indexes: [{ keyPath: ['kind', 'tag', 'value', 'created_at'], name: 'kind_tag_value_created_at' }],
} satisfies Schema<TagDB>

const seen = {
  name: 'seen' as const,
  keyPath: ['eventId', 'relay'],
  indexes: [{ keyPath: 'eventId' }, { keyPath: 'relay' }],
}

const relayInfo = {
  name: 'relayInfo' as const,
  keyPath: 'url',
  indexes: [],
} satisfies Schema<RelayInfoDB>

const relayStats = {
  name: 'relayStats' as const,
  keyPath: 'url',
  indexes: [],
} satisfies Schema<RelayStatsDB>

const metadata = {
  name: 'metadata' as const,
  keyPath: 'id',
  indexes: [],
}

const nip05 = {
  name: 'nip05' as const,
  keyPath: 'nip05',
  indexes: [],
} satisfies Schema<Nip05DB>

export const schemas = { events, tags, seen, relayInfo, relayStats, metadata, nip05 }

export type Schemas = typeof schemas
