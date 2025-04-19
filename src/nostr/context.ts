import type { RelayHints } from '@/core/types'
import type { batchers } from './batcher'

export type NostrContext = {
  relays?: string[]
  relaySets?: string[]
  relaysLocal?: string[]
  relayHints?: RelayHints
  pubkey?: string
  permission?: number
  batcher?: keyof typeof batchers | false
  nip05?: boolean
  authAuto?: boolean
  authWhitelist?: string[]
  ignoreRelays?: string[]
  maxRelaysPerUser?: number
  queryDB?: boolean
  insertDB?: boolean
  insertStore?: boolean
  outbox?: boolean
  prune?: boolean
}
