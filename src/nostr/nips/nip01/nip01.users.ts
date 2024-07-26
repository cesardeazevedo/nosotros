import { Kind } from 'constants/kinds'
import { type SubscriptionOptions } from 'core/NostrSubscription'
import { batcher } from 'nostr/batcher'
import type { NostrClient } from 'nostr/nostr'
import { insertEvent } from 'nostr/operators/insertEvent'
import { onNewEvents } from 'nostr/operators/onNewEvents'
import { withCache } from 'nostr/operators/queryCache'
import type { NoteDB } from 'nostr/types'
import { ignoreElements, map, merge, of, tap } from 'rxjs'
import { addEventToStore } from 'stores/operators/addEventToStore'
import { parseUser } from './metadata/parseUser'

const kinds = [Kind.Metadata]

export class NIP01Users {
  constructor(private client: NostrClient) {}

  subFromNote(note: NoteDB) {
    const authors = note.metadata.mentionedAuthors
    const relayHints = note.metadata.relayHints
    return this.subscribe(authors, { relayHints })
  }

  subscribe(authors: string[], options?: SubscriptionOptions) {
    const sub = this.client.subscribe({ kinds, authors }, options)
    const relayLists$ = this.client.relayList.subscribe(authors)

    const stream$ = of(sub).pipe(
      batcher.subscribe(),

      onNewEvents(sub),

      map((event) => parseUser(event)),

      insertEvent(),

      withCache(sub.filters),

      tap((user) => this.client.dns.enqueue(user)),
      tap((user) => addEventToStore(user)),
    )
    return merge(stream$, relayLists$.pipe(ignoreElements()))
  }
}
