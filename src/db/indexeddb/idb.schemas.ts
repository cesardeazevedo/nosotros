import type { Kind } from 'constants/kinds'
import type { EventDB, SeenDB, TagDB, UserRelayDB } from 'db/types'
import type { DBSchema } from 'idb'

export interface IndexedDBSchema extends DBSchema {
  events: {
    key: string
    value: EventDB
    indexes: {
      kind: number
      // pubkey: string
      created_at: number
      kind_pubkey: [kind: Kind, pubkey: string]
      kind_pubkey_created_at: [kind: Kind, pubkey: string, created_at: number]
    }
  }
  tags: {
    key: [eventId: string, tag: string, value: string]
    value: TagDB
    indexes: {
      kind_tag_value: [kind: Kind, tag: string, value: string]
    }
  }
  seen: {
    key: [eventId: string, relay: string]
    value: SeenDB
    indexes: {
      eventId: string
      relay: string
    }
  }
  userRelays: {
    key: [pubkey: string, relay: string]
    value: UserRelayDB
    indexes: {
      pubkey: string
      relay: string
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
  indexes: [
    { keyPath: 'kind' },
    { keyPath: 'pubkey' },
    { keyPath: ['kind', 'pubkey'], name: 'kind_pubkey' },
    { keyPath: ['kind', 'pubkey', 'created_at'], name: 'kind_pubkey_created_at' },
    { keyPath: ['kind', 'created_at'], name: 'kind_created_at' },
  ],
} satisfies Schema<EventDB>

const tags = {
  name: 'tags' as const,
  keyPath: ['eventId', 'tag', 'value'],
  indexes: [{ keyPath: ['kind', 'tag', 'value'], name: 'kind_tag_value' }],
} satisfies Schema<TagDB>

const seen = {
  name: 'seen' as const,
  keyPath: ['eventId', 'relay'],
  indexes: [{ keyPath: 'eventId' }, { keyPath: 'relay' }],
}

const userRelays = {
  name: 'userRelays' as const,
  keyPath: ['pubkey', 'relay'],
  indexes: [{ keyPath: 'pubkey' }, { keyPath: 'relay' }],
} satisfies Schema<UserRelayDB>

export const schemas = { events, tags, seen, userRelays }

export type Schemas = typeof schemas

export type IndexedDBIndexes = IndexedDBSchema[keyof IndexedDBSchema]['indexes']
