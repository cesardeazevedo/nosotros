import { NostrSubscription, type SubscriptionOptions } from 'core/NostrSubscription'
import type { Pool } from 'core/pool'
import type { NostrFilter } from 'core/types'
import { EMPTY, merge, of, type Observable } from 'rxjs'
import { settingsStore } from 'stores/ui/settings.store'
import { NostrFeeds } from './feeds'
import { NIP01Notes } from './nips/nip01/nip01.notes'
import { NIP01Users } from './nips/nip01/nip01.users'
import { NIP02Follows } from './nips/nip02.follows'
import { NIP25Reactions } from './nips/nip25.reactions'
import { NIP65RelayList } from './nips/nip65.relaylist'
import { outbox } from './outbox'
import { type NostrSettings } from './settings'
import { myRelays } from './trackers'

type NostrOptions = {
  relays?: string[]
  pubkey?: string
  settings?: Partial<NostrSettings>
}

export class NostrClient {
  notes = new NIP01Notes(this)
  users = new NIP01Users(this)
  follows = new NIP02Follows(this)
  reactions = new NIP25Reactions(this)
  relayList = new NIP65RelayList(this)

  feeds = new NostrFeeds(this)

  pool: Pool
  pubkey?: string
  relays: string[]
  relays$: Observable<string[]>
  settings: NostrSettings

  constructor(pool: Pool, options?: NostrOptions) {
    this.pool = pool
    this.pubkey = options?.pubkey
    this.relays = options?.relays || []
    this.relays$ = options?.pubkey ? myRelays(options.pubkey) : of(this.relays)
    this.settings = Object.assign({}, settingsStore.nostrSettings, options?.settings)

    // Initiate relay connection asap.
    this.relays$.subscribe((relays) => {
      relays.forEach((url) => {
        this.pool.getOrAddRelay(url)
      })
    })
  }

  subscribe(filters: NostrFilter | NostrFilter[], options?: SubscriptionOptions) {
    return new NostrSubscription(filters, {
      ...options,
      relays: merge(this.relays$, options?.relays || EMPTY),

      relayHints: this.settings.hintsEnabled ? options?.relayHints : {},

      outbox: outbox({
        enabled: this.settings.outboxEnabled,
        ignoreRelays: this.relays$,
        maxRelaysPerUser: this.settings.maxRelaysPerUser,
      }),
    })
  }
}
