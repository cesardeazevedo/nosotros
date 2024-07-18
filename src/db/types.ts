import type { Kind } from 'constants/kinds'
import type { NostrEvent, NostrFilter } from 'core/types'

export interface Storage {
  query(
    filters: NostrFilter | NostrFilter[],
  ): AsyncGenerator<Generator<AsyncGenerator<NostrEvent, void, unknown>, void, unknown>, void, undefined>
  queryEventByPubkey(kind: number, pubkey: string): Promise<NostrEvent | undefined>
  insert(event: NostrEvent): Promise<NostrEvent | false>
  querySeen(eventId: string): Promise<SeenDB[]>
  insertSeenBulk(seens: SeenDB[]): Promise<void>
  queryUserRelay(user: string): Promise<UserRelayDB[]>
  insertUserRelayBulk(data: UserRelayDB[]): Promise<void>
  clearDB(): Promise<void>
}

export interface EventDB extends NostrEvent {
  metadata: Record<string, unknown | unknown[]>
}

export interface TagDB {
  kind: NostrEvent['kind']
  eventId: string
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

export interface UserRelayDB {
  type: 'nip02' | 'nip05' | 'nip65'
  pubkey: string
  relay: string
  permission: 'read' | 'write' | undefined
}
