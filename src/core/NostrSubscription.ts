import type { NostrEvent } from 'nostr-tools'
import { EMPTY, filter, map, merge, mergeMap, of, take, type Observable } from 'rxjs'
import { createFilter } from './helpers/createFilter'
import { hintsToRelayFilters } from './helpers/hintsToRelayFilters'
import { isFilterValid } from './helpers/isFilterValid'
import { relaysToRelayFilters } from './helpers/relaysToRelayFilters'
import type { NostrFilter, RelayHints } from './types'

export type RelayFilters = [string, NostrFilter[]]

export type SubscriptionOptions = {
  id?: string
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
    this.id = options.id || Math.random().toString().slice(2, 10)

    this.filters = [filters].flat().map(createFilter).filter(isFilterValid)

    this.relays = options.relays || of([])
    this.outbox = options.outbox || (() => EMPTY)
    this.events = options.events || new Map()
    this.relayHints = options.relayHints

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
            // Apply relay hints ignoring fixed relays
            this.relays.pipe(
              take(1),
              mergeMap((relays) =>
                hintsToRelayFilters(filters, this.relayHints)
                  .filter((x) => !relays.includes(x[0]))
                  .slice(0, 4),
              ),
            ),
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
