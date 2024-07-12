import { dedupe } from 'core/helpers'
import { NostrSubscription, type SubscriptionOptions } from 'core/NostrSubscription'
import type { NostrFilter } from 'core/types'
import { EMPTY, first, merge, of, reduce, type Observable } from 'rxjs'
import { getOptimizedFilters } from 'stores/operators/getOptimizedFilters'
import { NostrFeeds } from './feeds'
import { NIP01Notes } from './nips/nip01/nip01.notes'
import { NIP01Users } from './nips/nip01/nip01.users'
import { NIP02Follows } from './nips/nip02.follows'
import { NIP25Reactions } from './nips/nip25.reactions'
import { NIP65RelayList } from './nips/nip65.relaylist'
import { pool } from './pool'
import { defaultNostrSettings, type NostrSettings } from './settings'
import { trackPubkey } from './trackers'

type NostrOptions = {
  relays?: string[]
  pubkey?: string
  settings?: NostrSettings
}

export class NostrClient {
  notes = new NIP01Notes(this)
  users = new NIP01Users(this)
  follows = new NIP02Follows(this)
  reactions = new NIP25Reactions(this)
  relayList = new NIP65RelayList(this)

  feeds = new NostrFeeds(this)

  pubkey?: string
  relays: string[]
  relays$: Observable<string[]>
  settings: NostrSettings

  constructor(options?: NostrOptions) {
    this.pubkey = options?.pubkey
    this.relays = options?.relays || []
    this.relays$ = options?.pubkey ? trackPubkey(options.pubkey) : of(this.relays)
    this.settings = options?.settings || defaultNostrSettings

    // Initiate relay connection asap.
    this.relays$.subscribe((relays) => {
      relays.forEach((url) => {
        pool.getOrAddRelay(url)
      })
    })
  }

  subscribe(filters: NostrFilter | NostrFilter[], options?: SubscriptionOptions) {
    return new NostrSubscription(getOptimizedFilters(filters), {
      ...options,
      relays: merge(this.relays$, options?.relays || EMPTY).pipe(
        reduce((acc, value) => dedupe([...acc, ...value])),
        first(),
      ),
    })
  }
}
