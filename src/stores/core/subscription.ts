import { Event, matchFilters, validateEvent, verifySignature } from 'nostr-tools'
import { Observable, Subject, filter, map, share } from 'rxjs'
import { Filter } from 'stores/core/filter'
import type { RootStore } from 'stores/root.store'
import { dedupe } from 'utils/utils'
import { FilterRelayGroup } from './filterRelay'
import { Relay } from './relay'
import { RelayHints, RelayHintsData } from './relayHints'

export enum SubscriptionEvents {
  EOSE = 'eose',
  EVENT = 'event',
}

export type SubscriptionOptions = {
  id?: string
  skipVerification?: boolean
  relayHints?: RelayHintsData
}

export class Subscription {
  readonly id: string

  filters: Filter[]
  filterRelays: FilterRelayGroup

  relays = new Map<string, Relay>()

  /**
   * Parent subscription in case the current subscription was grouped
   */
  parent: Subscription | undefined

  events = new Map<string, string[]>()

  onEvent$: Observable<Event>
  onEose$: Observable<void>

  event$: Subject<[string, Event]> = new Subject()
  count$: Subject<[string, Event]> = new Subject()
  eose$: Subject<void> = new Subject()
  unsubscribe$: Subject<void> = new Subject()

  constructor(
    private root: RootStore,
    filters: Filter | Filter[],
    options?: SubscriptionOptions,
  ) {
    this.id = options?.id || Math.random().toString().slice(2)

    this.filters = [filters].flat()
    this.filterRelays = new FilterRelayGroup(this.root, this.filtersData, options?.relayHints)

    this.onEose$ = this.eose$

    this.onEvent$ = this.event$.pipe(
      filter(([relay, event]) => {
        const seenEvent = this.events.get(event.id)
        this.events.set(event.id, dedupe(seenEvent, [relay]))
        return !seenEvent
      }),
      map((msg) => msg[1]),
      filter((event) => {
        // Only validate signature for new events
        return this.root.nostr.events.cachedKeys.has(event.id) || (validateEvent(event) && verifySignature(event))
      }),
      share(),
    )
  }

  get filtersData() {
    return this.filters.map((x) => x.data)
  }

  /**
   * Send subscription to all fixed relays from the pool
   */
  private subscribeFromFixedRelays() {
    for (const relay of this.root.nostr.pool.fixedRelays) {
      this.relays.set(relay.url, relay)
      relay.subscribe(this, ...this.filtersData)
    }
  }

  /**
   * Send subscription to filtersByRelay's
   */
  private subscribeFromRelayFilters() {
    const { pool } = this.root.nostr
    for (const [url, filter] of this.filterRelays.results) {
      // Ignore fixed relays since they are already subscribed
      if (!pool.urls.includes(url)) {
        const relay = pool.getRelay(url)
        if (relay) {
          this.relays.set(relay.url, relay)
          relay.subscribe(this, ...filter)
        }
      }
    }
  }

  async start() {
    await this.filterRelays.prepare()

    this.subscribeFromFixedRelays()
    this.subscribeFromRelayFilters()
    this.filterRelays.subscribeToPendingRelayList(() => {
      this.subscribeFromRelayFilters()
    })
  }

  stop() {
    for (const relay of this.relays.values()) {
      relay.unsubscribe(this)
    }
  }
}

export class SubscriptionGroup extends Subscription {
  subscriptions: Subscription[]

  constructor(root: RootStore, subscriptions: Subscription[], options?: SubscriptionOptions) {
    const filters = Filter.merge(subscriptions.flatMap((x) => x.filtersData)).map((filter) => new Filter(root, filter))
    const relayHints = RelayHints.merge(subscriptions.map((x) => x.filterRelays.hints || {}))

    super(root, filters, { ...options, relayHints })

    subscriptions.forEach((sub) => {
      sub.parent = this
    })

    this.subscriptions = subscriptions

    this.event$.subscribe((event) => {
      this.subscriptions.forEach((sub) => {
        if (matchFilters(sub.filtersData, event[1])) {
          sub.event$.next(event)
        }
      })
    })
  }
}
