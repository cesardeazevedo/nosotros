import { Kind } from 'constants/kinds'
import type { SubscriptionOptions } from 'core/NostrSubscription'
import { publish } from 'core/operators/publish'
import type { NostrEvent } from 'nostr-tools'
import { batcher } from 'nostr/batcher'
import type { NostrClient } from 'nostr/nostr'
import { insertEvent } from 'nostr/operators/insertEvent'
import { onNewEvents } from 'nostr/operators/onNewEvents'
import { withCache } from 'nostr/operators/queryCache'
import type { NoteDB } from 'nostr/types'
import { EMPTY, of, tap } from 'rxjs'
import { addEventToStore } from 'stores/operators/addEventToStore'

const kinds = [Kind.Reaction]

export class NIP25Reactions {
  constructor(private client: NostrClient) {}

  publish(event: NostrEvent, reaction: string) {
    const pub = this.client.publish(
      {
        kind: Kind.Reaction,
        content: reaction,
        tags: [
          ['p', event.pubkey],
          ['e', event.id],
        ],
      },
      {
        include: of([event]),
        // Optimistic updates
        onSigned: (event) => {
          addEventToStore(event)
        },
      },
    )

    return pub.pipe(
      tap((x) => console.log('HKKKK', x)),
      publish(this.client.pool),
    )
  }

  subFromNote(note: NoteDB, options?: SubscriptionOptions) {
    return this.subscribe([note.id, ...note.metadata.mentionedNotes], options)
  }

  subscribe(eventIds: string[], options?: SubscriptionOptions) {
    if (this.client.settings.nip25enabled) {
      const sub = this.client.subscribe({ kinds, '#e': eventIds }, options)
      return of(sub).pipe(
        batcher.subscribe(),

        onNewEvents(sub),

        insertEvent(),

        withCache(sub.filters),

        tap((event) => addEventToStore(event)),
      )
    }
    return EMPTY
  }
}
