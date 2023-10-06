import { comparer, reaction } from 'mobx'
import { Event, Filter as NostrFilter, matchFilters } from 'nostr-tools'
import { Observable, Subject, filter, map, share } from 'rxjs'
import { Filter } from 'stores/core/filter'
import { PostStore } from 'stores/modules/post.store'
import { RootStore } from 'stores/root.store'
import { dedupe, groupKeysToArray, toMap } from 'utils/utils'
import { Relay } from './relay'

export enum SubscriptionEvents {
  EOSE = 'eose',
  EVENT = 'event',
  COUNT = 'count',
}

export type SubscriptionOptions = {
  id?: string
  skipVerification?: boolean
  relayHints?: unknown
}

export type RelayHints = {
  authors?: Record<string, string[]>
  ids?: Record<string, string[]>
}

export class Subscription {
  readonly id: string

  filters: Filter[]
  // Pending filters waiting for author relay list
  filtersPending: NostrFilter[]
  // filters for specific relays
  filtersByRelay = new Map<string, NostrFilter[]>()

  relays = new Map<string, Relay>()

  relayHints: RelayHints
  /**
   * Parent subscription in case the current subscription was grouped
   */
  parent: Subscription | undefined

  skipVerification: boolean

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
    this.skipVerification = options?.skipVerification ?? false
    this.relayHints = options?.relayHints || {}

    this.filters = [filters].flat()
    this.filtersPending = this.filtersData

    this.onEose$ = this.eose$

    this.onEvent$ = this.event$.pipe(
      filter(([relay, event]) => {
        const seenEvent = this.events.get(event.id)
        this.events.set(event.id, dedupe(seenEvent, [relay]))
        return !seenEvent
      }),
      map((msg) => msg[1]),
      share(),
    )
  }

  get filtersData() {
    return this.filters.map((x) => x.data)
  }

  /**
   * Send subscription to all fixed relays from the pool
   */
  private subscribeFromPool() {
    for (const relay of this.root.nostr.pool.fixedRelays) {
      this.relays.set(relay.url, relay)
      relay.subscribe(this, ...this.filtersData)
    }
  }

  /**
   * Send subscription to filtersByRelay's
   */
  private subscribeFromRelayFilters() {
    for (const [url, filter] of this.filtersByRelay) {
      if (!this.root.nostr.pool.urls.includes(url)) {
        const relay = this.root.nostr.pool.getRelay(url)
        if (relay) {
          this.relays.set(relay.url, relay)
          relay.subscribe(this, ...filter)
        }
      }
    }
  }

  public async start() {
    await this.prepareRelayFilters()

    this.subscribeFromPool()
    this.subscribeFromRelayFilters()
    this.subscribeToPendingRelays()
  }

  public stop() {
    for (const relay of this.relays.values()) {
      relay.unsubscribe(this)
    }
  }

  /**
   * Listens for new userRelays (NIP-65)
   */
  private subscribeToPendingRelays() {
    const pendingAuthors = dedupe(this.filtersPending.map((filter) => filter.authors || []).flat())
    const disposer = reaction(
      () =>
        pendingAuthors.map((author) => [
          this.root.userRelays.relays.get(author),
          this.root.userRelays.relaysNIP05.get(author),
        ]),
      async () => {
        const filtersPending = this.filtersPending.slice()
        await this.prepareRelayFilters()
        const newFiltersPending = this.filtersPending.slice()
        if (!comparer.structural(filtersPending, newFiltersPending)) {
          this.subscribeFromRelayFilters()
        }
      },
      {
        delay: 1000, // throttle
      },
    )
    setTimeout(disposer, 10000)
  }

  /**
   * Group filters by authors and their respective relays, and by relayHints
   */
  public async prepareRelayFilters() {
    const filters = await Promise.all(
      this.filtersPending.map((filter) => Filter.groupAuthorsByRelay(filter, this.root, this.relayHints)),
    )
    this.filtersByRelay = toMap<NostrFilter[]>(groupKeysToArray(filters.map((filter) => filter.result)))
    this.filtersPending = filters.map((filter) => filter.pending)
  }
}

export class SubscriptionGroup extends Subscription {
  subscriptions: Subscription[]

  constructor(root: RootStore, subscriptions: Subscription[], options?: SubscriptionOptions) {
    const filters = Filter.merge(subscriptions.map((x) => x.filtersData).flat()).map(
      (filter) => new Filter(root, filter),
    )
    const relayHints = PostStore.mergeRelayHints(subscriptions.map((x) => x.relayHints))

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
