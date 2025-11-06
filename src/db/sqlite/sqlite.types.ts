import type { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '@/nostr/context'
import type { Metadata } from '@/nostr/types'
import type { NostrEvent } from 'nostr-tools'
import type { Nip05DB, RelayStatsDB, SeenDB } from '../types'

export type NostrEventStored = Omit<NostrEvent, 'tags'> & {
  tags: string
  metadata: string
}

export type NostrEventDB = Omit<NostrEvent, 'tags'> & {
  tags: string[][]
  metadata: Metadata | null
}

export type NostrEventExists = {
  id: string
  created_at: number
}

export type RelayStatsStored = {
  url: string
  data: string
}

export type RelayInfoStored = {
  url: string
  data: string
}

export type SqliteMessageResponse<T> = { result: T } | { error: string }
export type SqliteMessageResponseError = { error: string }
export type SqliteUsersRelaysParams = [string[], Pick<NostrContext, 'permission' | 'ignoreRelays' | 'maxRelaysPerUser'>]
export type SqliteUsersRelaysResponse = [eventId: string, pubkey: string, created_at: number, relays: string[]]

export type SqliteMessages =
  | { method: 'initialize' }
  | { method: 'exists'; params: string }
  | { method: 'existsReplaceable'; params: [Kind, string] }
  | { method: 'existsAddressable'; params: [Kind, string, string] }
  | { method: 'getRawEventById'; params: string }
  | { method: 'queryEvent'; params: NostrFilter }
  | { method: 'insertEvent'; params: NostrEventDB }
  | { method: 'deleteEvent'; params: string }
  | { method: 'querySeen'; params: string }
  | { method: 'insertSeen'; params: SeenDB }
  | { method: 'queryRelayStats'; params: string[] }
  | { method: 'insertRelayStats'; params: RelayStatsDB }
  | { method: 'queryRelayInfo'; params: string[] }
  | { method: 'insertRelayInfo'; params: RelayInfoStored }
  | { method: 'queryNip05'; params: string[] }
  | { method: 'insertNip05'; params: Nip05DB }
  | { method: 'countEvents' }
  | { method: 'countTags' }
  | { method: 'dbSize ' }
  | { method: 'exportDB' }
  | { method: 'deleteDB' }
