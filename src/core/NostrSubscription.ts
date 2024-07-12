import { EMPTY, filter, mergeWith, of, type Observable } from 'rxjs'
import { createFilter, isFilterValid } from './helpers'
import { hintsToRelayFilters } from './helpers/hintsToRelayFilters'
import { relaysToRelayFilters } from './helpers/relaysToRelayFilters'
import type { NostrFilter, RelayHints } from './types'

export type SubscriptionOptions = {
  relays?: Observable<string[]>
  relayFilters?: Observable<Record<string, NostrFilter[]>[]>
  relayHints?: RelayHints
}

export class NostrSubscription {
  readonly id: string
  readonly filters: NostrFilter[]
  readonly relays: Observable<string[]>
  readonly relayFilters: Observable<Record<string, NostrFilter[]>[]>
  readonly relayHints?: RelayHints

  constructor(filters: NostrFilter | NostrFilter[], options?: SubscriptionOptions) {
    this.id = Math.random().toString().slice(2, 10)

    this.filters = [filters].flat().map(createFilter).filter(isFilterValid)

    this.relayHints = options?.relayHints

    this.relays = options?.relays || of([])

    const relayFilters = options?.relayFilters || EMPTY

    this.relayFilters = relayFilters.pipe(
      // Apply relay hints to relayFilters
      mergeWith(of([hintsToRelayFilters(this.filters, this.relayHints)])),
      // Apply fixed relays to relayFilters
      mergeWith(relaysToRelayFilters(this.relays, this.filters)),

      filter((x) => x && x.length > 0 && Object.keys(x[0]).length > 0),
    )
  }
}
