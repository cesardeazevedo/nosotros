import type { BroadcastResponse } from '@/core/operators/broadcast'
import { type SubscriptionOptions } from 'core/NostrSubscription'
import type { Signer } from 'core/signers/signer'
import type { NostrFilter } from 'core/types'
import { type Observable } from 'rxjs'
import { type NostrSettings } from './settings'
import type { NostrEventMetadata } from './types'

type SubscriptionOptionsContext = Omit<SubscriptionOptions, 'outbox'> & {
  queryLocal?: boolean
  cacheFilter?: NostrFilter
  outbox?: boolean
  prune?: boolean
}

export type NostrContext = {
  signer: Signer | undefined
  relays?: string[]
  pubkey?: string
  permission?: number
  settings: NostrSettings
  subOptions?: SubscriptionOptionsContext
  // volatiles
  localSets: Set<string>
  inboxSets: Set<string>
  outboxSets: Set<string>
  inbox$: Observable<string[]>
  outbox$: Observable<string[]>
  onEvent: (event: NostrEventMetadata) => void
  onAuth?: (relay: string, challenge: string) => Observable<unknown>
  onPublish: (response: BroadcastResponse) => void
}
