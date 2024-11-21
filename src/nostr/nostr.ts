import { publish } from '@/core/operators/publish'
import { verify } from '@/core/operators/verify'
import type { PublisherOptions } from 'core/NostrPublish'
import { NostrPublisher } from 'core/NostrPublish'
import { NostrSubscription, type SubscriptionOptions } from 'core/NostrSubscription'
import type { Pool } from 'core/pool'
import type { Signer } from 'core/signers/signer'
import type { NostrFilter } from 'core/types'
import type { NostrEvent, UnsignedEvent } from 'nostr-tools'
import type { OperatorFunction } from 'rxjs'
import { EMPTY, merge, mergeWith, of, pipe, tap, throwError, type Observable } from 'rxjs'
import { batcher } from './batcher'
import { setCache } from './cache'
import { NostrFeeds } from './feeds'
import { InboxTracker } from './inbox'
import { Mailbox, toArrayRelay } from './mailbox'
import { NIP01Notes } from './nips/nip01/nip01.notes'
import { NIP01Users } from './nips/nip01/nip01.users'
import { NIP02Follows } from './nips/nip02.follows'
import { NIP05Dns } from './nips/nip05.dns'
import { NIP11RelayInfo } from './nips/nip11.relayinfo'
import { NIP18Reposts } from './nips/nip18.reposts'
import { NIP25Reactions } from './nips/nip25.reactions'
import { NIP50Search } from './nips/nip50.search'
import { NIP57Zaps } from './nips/nip57.zaps'
import { NIP65RelayList } from './nips/nip65.relaylist'
import { Notifications } from './notifications'
import { distinctEvent } from './operators/distinctEvents'
import * as localDB from './operators/localDB'
import * as localRelay from './operators/localRelay'
import { OutboxTracker } from './outbox'
import { pruneFilters } from './prune'
import { Seen } from './seen'
import { defaultNostrSettings, type NostrSettings } from './settings'

export type NostrClientOptions = {
  relays?: string[]
  pubkey?: string
  signer?: Signer
  settings?: Partial<NostrSettings>
}

export type ClientSubOptions = Omit<SubscriptionOptions, 'outbox'> & {
  cacheFilter?: NostrFilter
  outbox?: boolean
}

export class NostrClient {
  notes = new NIP01Notes(this)
  users = new NIP01Users(this)
  follows = new NIP02Follows(this)
  dns = new NIP05Dns(this)
  relayInfo = new NIP11RelayInfo()
  reposts = new NIP18Reposts(this)
  reactions = new NIP25Reactions(this)
  search = new NIP50Search(this)
  zaps = new NIP57Zaps(this)
  relayList = new NIP65RelayList(this)

  seen = new Seen()
  mailbox = new Mailbox(this)

  feeds = new NostrFeeds(this)
  notifications = new Notifications(this)

  localSets = new Set<string>()
  inboxSets = new Set<string>()
  outboxSets = new Set<string>()

  pool: Pool
  signer?: Signer
  pubkey?: string
  relays: string[]
  outbox$: Observable<string[]>
  inbox$: Observable<string[]>
  inboxTracker: InboxTracker
  outboxTracker: OutboxTracker
  settings: NostrSettings

  constructor(pool: Pool, options: NostrClientOptions = {}) {
    this.pool = pool
    this.signer = options.signer
    this.pubkey = options.pubkey
    this.relays = options.relays || []
    this.settings = { ...defaultNostrSettings, ...options.settings }

    this.localSets = new Set([...this.settings.localRelays])

    if (options.pubkey) {
      this.outbox$ = this.mailbox.track(options.pubkey, { permission: 'read' }).pipe(toArrayRelay)
      this.inbox$ = this.mailbox.track(options.pubkey, { permission: 'write' }).pipe(toArrayRelay)
    } else {
      this.outbox$ = of(this.relays)
      this.inbox$ = of(this.relays)
    }

    this.inboxTracker = new InboxTracker(this)
    this.outboxTracker = new OutboxTracker(this)

    this.initialize()
  }

  initialize() {
    this.initializeLocalRelays()
    this.initializeInboxRelays()
    this.initializeOutboxRelays()
  }

  private initializeLocalRelays() {
    this.localSets.forEach((url) => {
      this.pool.get(url)
    })
  }

  private initializeInboxRelays() {
    this.inbox$.subscribe((relays) => {
      relays.forEach((url) => {
        this.pool.get(url)
        this.inboxSets.add(url)
      })
    })
  }

  private initializeOutboxRelays() {
    this.outbox$.subscribe((relays) => {
      relays.forEach((url) => {
        this.pool.get(url)
        this.outboxSets.add(url)
      })
    })
  }

  // Query locally, IndexedDB or local relays
  query(sub: NostrSubscription, filter?: NostrFilter[]) {
    const filters = filter || sub.filters
    if (filters.length > 0) {
      const localDB$ = this.settings.localDB ? localDB.query(filters) : EMPTY
      const localRelays$ = localRelay.query(this.pool, Array.from(this.localSets), sub, filters)
      return merge(localDB$, localRelays$)
    }
    return EMPTY
  }

  // Insert locally, IndexedDB or local relays
  insert(): OperatorFunction<NostrEvent, NostrEvent> {
    const localRelays = Array.from(this.localSets)
    return pipe(
      this.settings.localDB ? localDB.insertEvent() : mergeWith(EMPTY),
      localRelays.length > 0 ? localRelay.insertEvent(this.pool, localRelays) : mergeWith(EMPTY),
    )
  }

  createSubscription(filters: NostrFilter | NostrFilter[], options?: ClientSubOptions) {
    return new NostrSubscription(filters, {
      ...options,
      relays: merge(this.outbox$, options?.relays || EMPTY),
      relayHints: this.settings.hintsEnabled ? options?.relayHints : {},
      outbox:
        this.settings.outboxEnabled && options?.outbox !== false
          ? this.outboxTracker.subscribe.bind(this.outboxTracker)
          : () => EMPTY,
      transform: pruneFilters,
    })
  }

  subscribe(filters: NostrFilter | NostrFilter[], options?: ClientSubOptions) {
    const sub = this.createSubscription(filters, options)

    return of(sub).pipe(
      batcher.subscribe(),

      tap(([relay, event]) => this.seen.insert(relay, event)),

      distinctEvent(),

      verify(),

      this.insert(),

      mergeWith(
        this.query(sub).pipe(
          tap((event) => {
            sub.add(event)
            this.seen.query(event)
            setCache(event)
          }),
        ),
      ),
    )
  }

  publish(unsignedEvent: Omit<UnsignedEvent, 'created_at' | 'pubkey'>, options: PublisherOptions = {}) {
    if (this.pubkey && this.signer) {
      const event = {
        ...unsignedEvent,
        pubkey: this.pubkey,
        created_at: parseInt((Date.now() / 1000).toString()),
      }
      const pub = new NostrPublisher(event, {
        ...options,
        signer: this.signer,
        relays: options.relays || this.inbox$,
        inbox: !options.relays ? this.inboxTracker.subscribe.bind(this.inboxTracker) : () => EMPTY,
      })

      return of(pub).pipe(publish(this.pool))
    }
    return throwError(() => new Error('Not authenticated'))
  }
}
