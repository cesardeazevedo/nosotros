import type { SubscriptionBatcher } from '@/core/SubscriptionBatcher'
import type { RelayHints } from '@/core/types'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { QueryKey } from '@tanstack/react-query'

export enum NetworkStrategy {
  CACHE_FIRST,
  CACHE_ONLY,
  REMOTE_ONLY,
}

export type NostrContext = {
  subId?: string
  relays?: string[]
  relaySets?: string[]
  relayHints?: RelayHints
  pubkey?: string
  permission?: number
  queryKey?: QueryKey
  closeOnEose?: boolean
  ignoreAuth?: boolean
  network?:
    | 'STALE_WHILE_REVALIDATE'
    | 'STALE_WHILE_REVALIDATE_BATCH'
    | 'CACHE_FIRST'
    | 'CACHE_FIRST_BATCH'
    | 'CACHE_ONLY'
    | 'REMOTE_ONLY'
    | 'LIVE'
  batcher?: SubscriptionBatcher<NostrEventDB>
  ignoreRelays?: string[]
  maxRelaysPerUser?: number
  outbox?: boolean
  negentropy?: boolean
}
