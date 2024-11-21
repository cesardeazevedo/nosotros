import type { NostrFilter } from '@/core/types'
import type { Note } from '@/stores/models/note'
import { reactionStore } from '@/stores/nostr/reactions.store'
import { Kind } from 'constants/kinds'
import type { NostrEvent } from 'nostr-tools'
import type { ClientSubOptions, NostrClient } from 'nostr/nostr'
import { EMPTY, tap } from 'rxjs'

const kinds = [Kind.Reaction]

export class NIP25Reactions {
  constructor(private client: NostrClient) {}

  publish(event: NostrEvent, reaction: string) {
    return this.client.publish(
      {
        kind: Kind.Reaction,
        content: reaction,
        tags: [
          ['p', event.pubkey],
          ['e', event.id],
        ],
      },
      {
        include: [event],
        // Optimistic updates
        onSigned: (event) => {
          reactionStore.add(event)
        },
      },
    )
  }

  subFromNote(note: Note, options?: ClientSubOptions) {
    const ids = [note.id, ...note.meta.mentionedNotes]
    const filter: NostrFilter = { kinds, '#e': ids }
    if (note.meta.lastSyncedAt) {
      filter.since = note.meta.lastSyncedAt
    }
    return this.subscribe(filter, {
      ...options,
      cacheFilter: filter,
    })
  }

  subscribe(filter: NostrFilter, options?: ClientSubOptions) {
    if (this.client.settings.nip25enabled) {
      return this.client.subscribe({ kinds, ...filter }, options).pipe(tap((event) => reactionStore.add(event)))
    }
    return EMPTY
  }
}
