import { Kind } from 'constants/kinds'
import type { SubscriptionOptions } from 'core/NostrSubscription'
import { decode } from 'light-bolt11-decoder'
import type { NostrEvent } from 'nostr-tools'
import { batcher } from 'nostr/batcher'
import type { NostrClient } from 'nostr/nostr'
import { insertEvent } from 'nostr/operators/insertEvent'
import { onNewEvents } from 'nostr/operators/onNewEvents'
import { withCache } from 'nostr/operators/queryCache'
import type { NoteDB, ZapDB } from 'nostr/types'
import { EMPTY, map, of, tap } from 'rxjs'
import { addEventToStore } from 'stores/operators/addEventToStore'

const kinds = [Kind.Zap]

const BOLT11_KEYS = ['coin_network', 'amount', 'separator', 'timestamp', 'expiry', 'payment_hash', 'description']

export class NIP57Zaps {
  constructor(private client: NostrClient) { }

  decode(event: NostrEvent) {
    const bolt11 = event.tags.find((tag) => tag[0] === 'bolt11')?.[1]
    if (bolt11) {
      decode
      const decoded = decode(bolt11)
      const data = decoded.sections.reduce(
        (acc, x) => {
          if (BOLT11_KEYS.includes(x.name)) {
            acc[x.name as keyof ZapDB['metadata']['bolt11']] = {
              letters: x.letters,
              value: x.value as never,
            }
          }
          return acc
        },
        {} as ZapDB['metadata']['bolt11'],
      )
      return {
        ...event,
        metadata: {
          bolt11: data,
        },
      } as ZapDB
    }
    return event
  }

  subFromNote(note: NoteDB, options?: SubscriptionOptions) {
    return this.subscribe([note.id, ...note.metadata.mentionedNotes], options)
  }

  subscribe(eventIds: string[], options?: SubscriptionOptions) {
    if (this.client.settings.nip57enabled) {
      const sub = this.client.subscribe({ kinds, '#e': eventIds }, options)
      return of(sub).pipe(
        batcher.subscribe(),

        onNewEvents(sub),

        map((event) => this.decode(event)),

        insertEvent(),

        withCache(sub.filters),

        tap((event) => addEventToStore(event)),
      )
    }
    return EMPTY
  }
}
