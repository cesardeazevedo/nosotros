import { Kind } from 'constants/kinds'
import { dedupe } from 'core/helpers'
import type { SubscriptionOptions } from 'core/NostrSubscription'
import type { NostrFilter } from 'core/types'
import { batcher } from 'nostr/batcher'
import type { NostrClient } from 'nostr/nostr'
import { insertEvent } from 'nostr/operators/insertEvent'
import { onNewEvents } from 'nostr/operators/onNewEvents'
import { withCache } from 'nostr/operators/queryCache'
import { type NoteDB } from 'nostr/types'
import { EMPTY, connect, expand, ignoreElements, map, merge, mergeMap, of, tap } from 'rxjs'
import Note from 'stores/models/note'
import { noteStore } from 'stores/nostr/notes.store'
import { parseNote } from './metadata/parseNote'

const kinds = [Kind.Text, Kind.Article]

export class NIP01Notes {
  constructor(private client: NostrClient) {}

  subscribe(filters: NostrFilter, options?: SubscriptionOptions) {
    const sub = this.client.subscribe(filters, options)

    return of(sub).pipe(
      batcher.subscribe(),

      onNewEvents(sub),

      map((event) => parseNote(event)),

      insertEvent(),

      withCache(sub.filters),

      connect((notes$) => {
        return merge(
          notes$,
          notes$.pipe(
            mergeMap((note) => this.client.users.subFromNote(note)),
            ignoreElements(),
          ),
        )
      }),

      tap((event) => {
        noteStore.add(new Note(event, this.client))
      }),
    )
  }

  subReplies(note: NoteDB, options?: SubscriptionOptions) {
    return this.subWithRelated({ kinds, '#e': [note.id] }, options)
  }

  subRelatedFromNote(note: NoteDB, options?: SubscriptionOptions) {
    const rootNoteId = note.metadata.rootNoteId
    const mentionedNotes = note.metadata.mentionedNotes
    const relayHints = note.metadata.relayHints
    const ids = dedupe([rootNoteId], mentionedNotes)
    if (ids.length > 0) {
      return this.subscribe({ ids }, { ...options, relayHints })
    }
    return EMPTY
  }

  subWithRelated(filters: NostrFilter, options?: SubscriptionOptions) {
    const notes$ = this.subscribe({ kinds, ...filters }, options)

    return notes$.pipe(
      connect((shared$) => {
        const related$ = shared$.pipe(
          // We might want to do this differently
          // We only wanna recursive twice for quoted notes.
          // We only wanna go once for parent posts.
          mergeMap((note) => {
            return of(note).pipe(
              expand((note, depth) => {
                // Make this configurable
                if (depth >= 8) {
                  return EMPTY
                }
                return this.subRelatedFromNote(note, options)
              }),
            )
          }),
          // filter((note) => note.metadata.isRoot)
          ignoreElements(),
        )
        return merge(shared$, related$)
      }),
    )
  }
}
