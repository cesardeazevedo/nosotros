import { mergeRelayHints } from '@/core/mergers/mergeRelayHints'
import { ofKind } from '@/core/operators/ofKind'
import { subscribeIdsFromQuotes } from '@/nostr/operators/subscribeIdsFromQuotes'
import type { NostrEventComment } from '@/nostr/types'
import { metadataSymbol, type NostrEventNote } from '@/nostr/types'
import { Kind } from 'constants/kinds'
import type { NostrFilter } from 'core/types'
import type { ClientSubOptions, NostrClient } from 'nostr/nostr'
import type { Observable } from 'rxjs'
import { EMPTY, connect, expand, filter, from, ignoreElements, merge, mergeMap, of, skip } from 'rxjs'

export type Note$ = Observable<NostrEventNote | NostrEventComment>

type ThreadsOptions = {
  includeRoot?: boolean
  depth?: number
}

type QuoteOptions = {
  depth?: number
}

type RelatedOptions = ClientSubOptions & {
  threads?: ThreadsOptions
  quotes?: QuoteOptions
}

export class NIP01Notes {
  constructor(private client: NostrClient) {}

  subscribeNoteAuthors() {
    return (source$: Note$) => {
      return source$.pipe(
        mergeMap((event) => {
          const metadata = event[metadataSymbol]
          const authors = [event.pubkey, ...(metadata.mentionedAuthors || [])]
          const relayHints = metadata.relayHints
          return from(authors).pipe(mergeMap((pubkey) => this.client.users.subscribe(pubkey, { relayHints })))
        }),
      )
    }
  }

  subscribeParent() {
    return (source$: Note$): Note$ => {
      return source$.pipe(
        mergeMap((event) => {
          return of(event).pipe(
            expand((event, depth) => {
              if (depth > 1) {
                return EMPTY
              }
              const { parentId, relayHints } = event[metadataSymbol]
              if (parentId) {
                return subscribeIdsFromQuotes(parentId, this.client, { relayHints }).pipe(
                  // People are using NIP-10 replies to a bunch of crap
                  ofKind<NostrEventNote | NostrEventComment>([Kind.Text, Kind.Comment, Kind.Article]),
                  this.withRelatedNotes(),
                )
              }
              return EMPTY
            }),
            filter((x) => {
              // Only return the first parent
              const parent = event[metadataSymbol].parentId
              if (parent) {
                return x.id === parent
              }
              return true
            }),
          )
        }),
      )
    }
  }

  subscribeQuotes(options?: QuoteOptions) {
    const maxDepth = options?.depth || 16
    return (source$: Note$) => {
      return source$.pipe(
        mergeMap((event) => {
          return of(event).pipe(
            expand((event, depth) => {
              if (depth >= maxDepth) {
                return EMPTY
              }
              const metadata = event[metadataSymbol]
              const ids = metadata.mentionedNotes || []

              if (ids.length) {
                return from(ids).pipe(
                  mergeMap((id) => {
                    const relayHints = mergeRelayHints([metadata.relayHints, { idHints: { [id]: [event.pubkey] } }])
                    return subscribeIdsFromQuotes(id, this.client, { relayHints }).pipe(
                      ofKind<NostrEventNote>([Kind.Text]),
                      this.subscribeParent(),
                    )
                  }),
                )
              }
              return EMPTY
            }),
            skip(1), // skip the source
          )
        }),
      )
    }
  }

  withThreads() {
    return connect((event$: Note$) => {
      return merge(
        event$,
        event$.pipe(
          mergeMap((event) => {
            const rootId = event[metadataSymbol].rootId
            if (rootId) {
              return merge(this.subNotesWithRelated({ ids: [rootId] }), this.subReplies(rootId))
            }
            return EMPTY
          }),
        ),
      )
    })
  }

  withRelatedAuthors() {
    return connect((shared$: Note$) => {
      return merge(shared$, shared$.pipe(this.subscribeNoteAuthors(), ignoreElements()))
    })
  }

  withRelatedNotes(options?: RelatedOptions) {
    return connect((event$: Note$) => {
      return merge(
        event$,
        event$.pipe(this.subscribeNoteAuthors(), ignoreElements()),
        event$.pipe(this.subscribeQuotes(options?.quotes), ignoreElements()), // quotes are never included in the feed
      )
    })
  }

  subscribe(filters: NostrFilter, options?: ClientSubOptions) {
    return this.client.subscribe({ ...filters, kinds: [Kind.Text] }, options).pipe(ofKind<NostrEventNote>([Kind.Text]))
  }

  subReplies(id: string, options?: ClientSubOptions) {
    return this.subNotesWithRelated({ kinds: [Kind.Text], '#e': [id] }, options)
  }

  subNotesWithRelated(filters: NostrFilter, options?: RelatedOptions) {
    return this.subscribe(filters, options).pipe(this.withRelatedNotes(options))
  }

  subRelatedNotesWithParent(filters: NostrFilter, options?: RelatedOptions) {
    return this.subNotesWithRelated(filters, options).pipe(this.subscribeParent())
  }
}
