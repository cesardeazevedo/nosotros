import { DEFAULT_RELAYS } from '@/constants/relays'
import type { BroadcastResponse } from '@/core/operators/broadcast'
import { onAuth } from '@/core/operators/onAuth'
import { verifyWorker } from '@/core/operators/verifyWorker'
import { NostrSubscription, type SubscriptionOptions } from 'core/NostrSubscription'
import type { Pool } from 'core/pool'
import type { Signer } from 'core/signers/signer'
import type { NostrFilter } from 'core/types'
import type { NostrEvent } from 'nostr-tools'
import { identity } from 'observable-hooks'
import type { OperatorFunction } from 'rxjs'
import {
  defaultIfEmpty,
  distinct,
  EMPTY,
  filter,
  map,
  merge,
  mergeMap,
  mergeWith,
  of,
  pipe,
  tap,
  type Observable,
} from 'rxjs'
import { batcher } from './batcher'
import { setCache } from './cache'
import { NostrFeeds } from './feeds'
import { READ, WRITE } from './helpers/parseRelayList'
import { InboxTracker } from './inbox'
import { Mailbox, toArrayRelay } from './mailbox'
import { NIP01Notes } from './nips/nip01.notes'
import { NIP05Dns } from './nips/nip05.dns'
import { NIP18Reposts } from './nips/nip18.reposts'
import { NIP23Articles } from './nips/nip23.articles'
import { NIP25Reactions } from './nips/nip25.reactions'
import { NIP50Search } from './nips/nip50.search'
import { NIP57Zaps } from './nips/nip57.zaps'
import { NIP65RelayList } from './nips/nip65.relaylist'
import { distinctEvent } from './operators/distinctEvents'
import * as localDB from './operators/localDB'
import * as localRelay from './operators/localRelay'
import { parseEventMetadata } from './operators/parseMetadata'
import { OutboxTracker } from './outbox'
import { pruneFilters } from './prune'
import { Seen } from './seen'
import { defaultNostrSettings, type NostrSettings } from './settings'
import type { NostrEventMetadata } from './types'

export type NostrClientOptions = {
  relays?: string[]
  pubkey?: string
  signer?: Signer
  settings?: NostrSettings
  onEvent?: (event: NostrEventMetadata) => void
  onAuth?: (relay: string, challenge: string) => Observable<unknown>
  onPublish?: (response: BroadcastResponse) => void
}

export type ClientSubOptions = Omit<SubscriptionOptions, 'outbox'> & {
  queryLocal?: boolean
  cacheFilter?: NostrFilter
  outbox?: boolean
  prune?: boolean
}

export class NostrClient {
  notes = new NIP01Notes(this)
  dns = new NIP05Dns(this)
  reposts = new NIP18Reposts(this)
  articles = new NIP23Articles(this)
  reactions = new NIP25Reactions(this)
  search = new NIP50Search(this)
  zaps = new NIP57Zaps(this)
  relayList = new NIP65RelayList(this)

  seen = new Seen()
  mailbox = new Mailbox(this)

  feeds = new NostrFeeds(this)

  localSets = new Set<string>()
  inboxSets = new Set<string>()
  outboxSets = new Set<string>()

  signer?: Signer
  pubkey?: string
  relays: string[]
  outbox$: Observable<string[]>
  inbox$: Observable<string[]>
  inboxTracker: InboxTracker
  outboxTracker: OutboxTracker
  settings: NostrSettings

  constructor(
    public pool: Pool,
    public options: NostrClientOptions = {},
  ) {
    this.signer = options.signer
    this.pubkey = options.pubkey
    this.relays = options.relays || []
    this.settings = options.settings || defaultNostrSettings

    this.localSets = new Set([...this.settings.localRelays])

    // ownership of this client
    if (this.pubkey) {
      this.outbox$ = this.mailbox
        .track(this.pubkey, { permission: WRITE })
        .pipe(toArrayRelay, defaultIfEmpty(DEFAULT_RELAYS))
      this.inbox$ = this.mailbox
        .track(this.pubkey, { permission: READ })
        .pipe(toArrayRelay, defaultIfEmpty(DEFAULT_RELAYS))
    } else {
      this.outbox$ = of(this.relays)
      this.inbox$ = of(this.relays)
    }

    this.inboxTracker = new InboxTracker(this)
    this.outboxTracker = new OutboxTracker(this)
  }

  initialize() {
    this.initializeLocalRelays()
    return merge(this.initializeInboxRelays(), this.initializeOutboxRelays()).pipe(
      // Handle auth
      mergeMap(identity),
      map((relay) => this.pool.get(relay)),
      filter((relay) => !!relay),
      mergeMap((relay) => {
        return relay.websocket$.pipe(
          onAuth(),
          map((msg) => [relay.url, msg] as const),
        )
      }),
      distinct(([msg]) => msg[1]),
      mergeMap(([relay, msg]) => this.options.onAuth?.(relay, msg[1]) || EMPTY),
    )
  }

  private initializeLocalRelays() {
    this.localSets.forEach((url) => {
      this.pool.get(url)
    })
  }

  private initializeInboxRelays() {
    return this.inbox$.pipe(
      tap((relays) => {
        relays.forEach((url) => {
          this.pool.get(url)
          this.inboxSets.add(url)
        })
      }),
    )
  }

  private initializeOutboxRelays() {
    return this.outbox$.pipe(
      tap((relays) => {
        relays.forEach((url) => {
          this.pool.get(url)
          this.outboxSets.add(url)
        })
      }),
    )
  }

  // Query locally, IndexedDB or local relays
  query(sub: NostrSubscription, options?: ClientSubOptions) {
    const filters = options?.cacheFilter ? [options.cacheFilter] : sub.filters
    if (filters.length > 0 && options?.queryLocal !== false) {
      const localDB$ = this.settings.localDB ? localDB.query(filters) : EMPTY
      const localRelays$ = localRelay.query(this.pool, Array.from(this.localSets), sub, filters)
      return merge(localDB$, localRelays$).pipe(
        tap((event) => {
          sub.add(event)
          this.seen.query(event)
          setCache(event)
        }),
      )
    }
    return EMPTY
  }

  // Insert locally, IndexedDB or local relays
  insert(options?: ClientSubOptions): OperatorFunction<NostrEvent, NostrEvent> {
    const localRelays = Array.from(this.localSets)
    if (options?.queryLocal !== false) {
      return pipe(
        this.settings.localDB ? localDB.insertEvent() : mergeWith(EMPTY),
        localRelays.length > 0 ? localRelay.insertEvent(this.pool, localRelays) : mergeWith(EMPTY),
      )
    }
    return mergeWith(EMPTY)
  }

  createSubscription(filters: NostrFilter | NostrFilter[], options?: ClientSubOptions) {
    return new NostrSubscription(filters, {
      ...options,
      relays: merge(this.inbox$, this.outbox$, of(this.relays), options?.relays || EMPTY),
      relayHints: this.settings.hints ? options?.relayHints : {},
      outbox:
        this.settings.outbox && options?.outbox !== false
          ? this.outboxTracker.subscribe.bind(this.outboxTracker)
          : () => EMPTY,
      transform: options?.prune === false ? undefined : pruneFilters,
    })
  }

  subscribe(filters: NostrFilter | NostrFilter[], options?: ClientSubOptions) {
    const sub = this.createSubscription(filters, options)

    return of(sub).pipe(
      batcher.subscribe(),

      tap(([relay, event]) => this.seen.insert(relay, event)),

      distinctEvent(sub),

      verifyWorker(),

      this.insert(options),

      mergeWith(this.query(sub, options)),

      parseEventMetadata(),

      tap(this.options.onEvent),
    )
  }
}
