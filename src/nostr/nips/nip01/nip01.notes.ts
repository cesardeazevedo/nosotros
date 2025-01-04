import { dedupe } from '@/core/helpers/dedupe'
import { mapMetadata } from '@/nostr/operators/mapMetadata'
import { pruneIds } from '@/nostr/prune'
import type { Note } from '@/stores/notes/note'
import { noteStore } from '@/stores/notes/notes.store'
import { Kind } from 'constants/kinds'
import type { NostrFilter } from 'core/types'
import type { ClientSubOptions, NostrClient } from 'nostr/nostr'
import type { Observable } from 'rxjs'
import { EMPTY, connect, expand, filter, from, ignoreElements, map, merge, mergeMap, of, pipe } from 'rxjs'
import { parseNote } from './metadata/parseNote'

export class NIP01Notes {
  constructor(private client: NostrClient) {}

  process() {
    return pipe(
      mapMetadata(parseNote),

      map(([event, metadata]) => noteStore.add(event, metadata)),

      connect((notes$) => {
        return merge(
          notes$,
          // Get the note author
          notes$.pipe(
            mergeMap((note) => {
              const relayHints = note.metadata?.relayHints
              const authors = dedupe([note.event.pubkey, ...(note.metadata.mentionedAuthors || [])])
              return from(authors).pipe(mergeMap((pubkey) => this.client.users.subscribe(pubkey, { relayHints })))
            }),
            ignoreElements(),
          ),
        )
      }),
    )
  }

  subscribe(filters: NostrFilter, options?: ClientSubOptions) {
    return this.client.subscribe(filters, options).pipe(
      // filter out any non text article
      filter((event) => [Kind.Text, Kind.Article, Kind.Photos].indexOf(event.kind) > -1),

      this.process(),
    )
  }

  subReplies(id: string, options?: ClientSubOptions) {
    return this.subWithRelated({ kinds: [Kind.Text], '#e': [id] }, options)
  }

  subRelated(note: Note, options?: ClientSubOptions): Observable<Note> {
    return of(note).pipe(
      expand((note, depth) => {
        // Make this configurable
        if (depth >= 16) {
          return EMPTY
        }
        const mentioned = note.metadata.mentionedNotes || []
        const related = note.metadata.tags.e?.map((x) => x[1]).filter((x) => mentioned.indexOf(x) === -1) || []
        const relayHints = note.metadata.relayHints
        const subOptions = { ...options, relayHints }
        return merge(
          this.subIds(related, subOptions),
          this.subIds(mentioned, subOptions).pipe(
            mergeMap((note) => this.subRelated(note)),
            // Don't include quoted notes on the feed
            ignoreElements(),
          ),
        )
      }),
    )
  }

  subIds(ids: string[], options?: ClientSubOptions) {
    // filter out ids from d tags
    const neededIds = pruneIds(ids).filter((x) => x.indexOf(':') === -1)
    if (neededIds.length > 0) {
      return this.subscribe({ ids: neededIds }, options)
    }
    return EMPTY
  }

  subWithRelated(filters: NostrFilter, options?: ClientSubOptions) {
    return this.subscribe(filters, options).pipe(mergeMap((note) => this.subRelated(note)))
  }
}
