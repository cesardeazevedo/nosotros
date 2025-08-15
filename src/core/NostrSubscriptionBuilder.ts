import type { NostrEvent } from 'nostr-tools'
import { EMPTY, from, mergeWith, type Observable } from 'rxjs'
import { relaysToRelayFilters } from './helpers/relaysToRelayFilters'
import type { NostrFilter, RelayHints } from './types'
import { hintsToRelayFilters } from './helpers/hintsToRelayFilters'

export type RelayFilters = [string, NostrFilter]
export type RelayFiltersMerged = [string, NostrFilter[]][]

export type SubscriptionOutboxOptions = {
  id?: string
  filter: NostrFilter
  relays?: string[]
  relayFilters?: Observable<RelayFilters>
  relayHints?: RelayHints
  negentropy?: boolean
  events?: Map<string, { id: string; created_at: number }>
  closeOnEose?: boolean
}

export class NostrSubscriptionBuilder {
  readonly id: string | undefined
  readonly filter: NostrFilter | undefined
  readonly relays: string[]
  readonly relayFilters: Observable<RelayFilters>
  readonly relayHints: RelayHints
  readonly negentropy: boolean | undefined
  events: Map<string, NostrEvent>
  closeOnEose: boolean

  constructor(options: SubscriptionOutboxOptions) {
    this.id = options.id
    this.filter = options.filter
    this.relays = options.relays || []
    this.relayHints = options.relayHints || {}
    this.closeOnEose = options.closeOnEose ?? true
    this.events = options.events || new Map()
    this.negentropy = options.negentropy

    this.relayFilters = from(options.relayFilters || EMPTY).pipe(
      mergeWith(this.filter ? relaysToRelayFilters(this.relays, this.filter) : EMPTY),
      mergeWith(
        hintsToRelayFilters(this.filter, this.relayHints)
          .filter((x) => !this.relays.includes(x[0]))
          .slice(0, 4),
      ),
    )
  }
}

export function createSubscriptionBuilder(options: SubscriptionOutboxOptions) {
  return new NostrSubscriptionBuilder(options)
}
