import { Kind } from 'constants/kinds'
import { OUTBOX_RELAYS } from 'constants/relays'
import type { NostrEvent } from 'core/types'
import type { UserRelayDB } from 'db/types'
import { batcher } from 'nostr/batcher'
import type { NostrClient } from 'nostr/nostr'
import { insertEvent } from 'nostr/operators/insertEvent'
import { insertUserRelay } from 'nostr/operators/insertUserRelay'
import { onNewEvents } from 'nostr/operators/onNewEvents'
import { withCache } from 'nostr/operators/queryCache'
import { of, tap } from 'rxjs'
import { addEventToStore } from 'stores/operators/addEventToStore'

export class NIP65RelayList {
  constructor(private client: NostrClient) { }

  parseUserRelay(event: NostrEvent) {
    return event.tags.filter((tag) => tag[0] === 'r').map((tag) => ({
      type: 'nip65',
      pubkey: event.pubkey,
      relay: tag[1],
      permission: tag[2] as UserRelayDB['permission'],
    } as UserRelayDB))
  }

  subscribe(authors: string[]) {
    const filter = { kinds: [Kind.RelayList], authors }
    const sub = this.client.subscribe(filter, {
      relays: of(OUTBOX_RELAYS)
    })

    return of(sub).pipe(
      batcher.subscribe(),

      onNewEvents(sub),

      insertEvent(),
      tap((event) => insertUserRelay(event.pubkey, this.parseUserRelay(event))),

      withCache(sub.filters),

      tap((event) => addEventToStore(event)),
    )
  }
}
