import { EMPTY, from, mergeWith, of, type Observable } from 'rxjs'
import { createFilter, isFilterValid } from './helpers'
import { hintsToRelayFilters } from './helpers/hintsToRelayFilters'
import { relaysToRelayFilters } from './helpers/relaysToRelayFilters'
import type { NostrFilter, RelayHints } from './types'

export type RelayFilters = [string, NostrFilter[]]

export type SubscriptionOptions = {
  relays?: Observable<string[]>
  relayFilters?: Observable<RelayFilters>
  relayHints?: RelayHints
  outbox?: (filters: NostrFilter[]) => Observable<RelayFilters>
}

export class NostrSubscription {
  readonly id: string
  readonly filters: NostrFilter[]
  readonly relays: SubscriptionOptions['relays']
  readonly relayFilters: Observable<RelayFilters>
  readonly relayHints?: SubscriptionOptions['relayHints']
  readonly outbox: (filters: NostrFilter[]) => Observable<RelayFilters>

  constructor(filters: NostrFilter | NostrFilter[], options?: SubscriptionOptions) {
    this.id = Math.random().toString().slice(2, 10)

    this.filters = [filters].flat().map(createFilter).filter(isFilterValid)

    this.relayHints = options?.relayHints

    this.relays = options?.relays || of([])

    this.outbox = options?.outbox || (() => EMPTY)

    const relayFilters = options?.relayFilters || EMPTY

    this.relayFilters = relayFilters.pipe(
      // Apply fixed relays
      mergeWith(relaysToRelayFilters(this.relays, this.filters)),

      // Apply relay hints
      mergeWith(from(hintsToRelayFilters(this.filters, this.relayHints))),

      // Apply outbox
      mergeWith(this.outbox(this.filters)),
    )
  }
}
