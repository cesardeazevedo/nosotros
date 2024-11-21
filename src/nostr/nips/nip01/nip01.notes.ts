import type { PublisherOptions } from '@/core/NostrPublish'
import { mapMetadata } from '@/nostr/operators/mapMetadata'
import { pruneIds } from '@/nostr/prune'
import { Kind } from 'constants/kinds'
import type { NostrFilter } from 'core/types'
import type { UnsignedEvent } from 'nostr-tools'
import type { NostrClient, ClientSubOptions } from 'nostr/nostr'
import { type NoteMetadataDB } from 'nostr/types'
import { EMPTY, connect, expand, ignoreElements, map, merge, mergeMap, of } from 'rxjs'
import { Note } from 'stores/models/note'
import { noteStore } from 'stores/nostr/notes.store'
import { parseNote } from './metadata/parseNote'

export class NIP01Notes {
  constructor(private client: NostrClient) {}

  publish(event: UnsignedEvent, options: PublisherOptions) {
    return this.client.publish(event, options)
  }

  subscribe(filters: NostrFilter, options?: ClientSubOptions) {
    return this.client.subscribe(filters, options).pipe(
      mapMetadata(parseNote),

      map(([event, metadata]) => {
        const note = new Note(event, metadata)
        noteStore.add(note)
        return note
      }),

      connect((notes$) => {
        return merge(
          notes$,
          // Get the note author
          notes$.pipe(
            mergeMap((note) => this.client.users.subFromNote(note)),
            ignoreElements(),
          ),
        )
      }),
    )
  }

  subReplies(note: NoteMetadataDB, options?: ClientSubOptions) {
    return this.subWithRelated({ kinds: [Kind.Text], '#e': [note.id] }, options)
  }

  subIds(ids: string[], options?: ClientSubOptions) {
    const neededIds = pruneIds(ids)
    if (neededIds.length > 0) {
      return this.subscribe({ ids: neededIds }, options)
    }
    return EMPTY
  }

  subWithRelated(filters: NostrFilter, options?: ClientSubOptions) {
    return this.subscribe(filters, options).pipe(
      // Get the related notes (parent, mentioned quote notes)
      connect((shared$) => {
        return shared$.pipe(
          mergeMap((note) => {
            return of(note).pipe(
              expand((note, depth) => {
                // Make this configurable
                if (depth >= 16) {
                  return EMPTY
                }
                const mentioned = note.meta.mentionedNotes
                const related = note.meta.tags.e?.map((x) => x[1]).filter((x) => mentioned.indexOf(x) === -1)
                const relayHints = note.meta.relayHints
                const subOptions = { ...options, relayHints }
                return merge(
                  this.subIds(related, subOptions),
                  // Don't include quoted notes on the feed
                  this.subIds(mentioned, subOptions).pipe(ignoreElements()),
                )
              }),
            )
          }),
        )
      }),
    )
  }
}
