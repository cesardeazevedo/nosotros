import { DEFAULT_RELAYS } from '@/constants/relays'
import type { BroadcastResponse } from '@/core/operators/broadcast'
import { onAuth } from '@/core/operators/onAuth'
import { type SubscriptionOptions } from 'core/NostrSubscription'
import type { Pool } from 'core/pool'
import type { Signer } from 'core/signers/signer'
import type { NostrFilter } from 'core/types'
import { identity } from 'observable-hooks'
import { defaultIfEmpty, distinct, EMPTY, filter, map, merge, mergeMap, of, tap, type Observable } from 'rxjs'
import { READ, WRITE } from './helpers/parseRelayList'
import { InboxTracker } from './inbox'
import { Mailbox, toArrayRelay } from './mailbox'
import { Nip05 } from './nip05'
import { OutboxTracker } from './outbox'
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
  seen = new Seen()
  mailbox = new Mailbox(this)
  nip05 = new Nip05(this)

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
}
