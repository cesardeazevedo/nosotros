import type { NostrEvent } from 'nostr-tools'
import { EMPTY, filter, map, merge, mergeMap, of, type Observable } from 'rxjs'
import { createFilter, isFilterValid } from './helpers'
import { hintsToRelayFilters } from './helpers/hintsToRelayFilters'
import { relaysToRelayFilters } from './helpers/relaysToRelayFilters'
import type { NostrFilter, RelayHints } from './types'

export type RelayFilters = [string, NostrFilter[]]

export type SubscriptionOptions = {
  relays?: Observable<string[]>
  relayFilters?: Observable<RelayFilters>
  relayHints?: RelayHints
  transform?: (filters: NostrFilter[]) => NostrFilter[]
  events?: Map<string, NostrEvent>
  outbox?: (filters: NostrFilter[], hints?: RelayHints) => Observable<RelayFilters>
}

export class NostrSubscription {
  readonly id: string
  readonly filters: NostrFilter[]
  readonly relays: Observable<string[]>
  readonly relayFilters: Observable<RelayFilters>
  readonly relayHints?: SubscriptionOptions['relayHints']
  readonly outbox: (filters: NostrFilter[], hints?: RelayHints) => Observable<RelayFilters>

  // For negentropy and other cases
  events: Map<string, NostrEvent>

  constructor(filters: NostrFilter | NostrFilter[], options: SubscriptionOptions = {}) {
    this.id = Math.random().toString().slice(2, 10)

    this.filters = [filters].flat().map(createFilter).filter(isFilterValid)

    this.relays = options.relays || of([])
    this.relayHints = options.relayHints
    this.outbox = options.outbox || (() => EMPTY)
    this.events = options.events || new Map()

    if (options.relayFilters) {
      // Pipeline already defined
      this.relayFilters = options.relayFilters
    } else {
      this.relayFilters = of(this.filters).pipe(
        // Apply filter optimizations
        map((filters) => options.transform?.(filters) || filters),

        mergeMap((filters) => {
          return merge(
            // Apply fixed relays
            relaysToRelayFilters(this.relays, filters),
            // Apply relay hints
            hintsToRelayFilters(filters, this.relayHints),
            // Apply outbox
            this.outbox(filters, this.relayHints),
          )
        }),

        filter(([, filters]) => filters.filter(isFilterValid).length > 0),
      )
    }
  }

  add(event: NostrEvent) {
    this.events.set(event.id, event)
  }
}
