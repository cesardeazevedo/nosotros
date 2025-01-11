import { ofKind } from '@/core/operators/ofKind'
import { subscribeIdsFromQuotes } from '@/nostr/operators/subscribeIdsFromQuotes'
import { metadataSymbol, type NostrEventNote } from '@/nostr/types'
import { Kind } from 'constants/kinds'
import type { NostrFilter } from 'core/types'
import type { ClientSubOptions, NostrClient } from 'nostr/nostr'
import type { Observable } from 'rxjs'
import { EMPTY, connect, expand, filter, from, ignoreElements, merge, mergeMap, of, skip } from 'rxjs'

export type Note$ = Observable<NostrEventNote>

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
    return (source$: Note$) => {
      return source$.pipe(
        mergeMap((event) => {
          return of(event).pipe(
            expand((event, depth) => {
              if (depth > 1) {
                return EMPTY
              }
              const { parentNoteId } = event[metadataSymbol]
              if (parentNoteId) {
                return this.subNotesWithRelated({ kinds: [Kind.Text], ids: [parentNoteId] })
              }
              return EMPTY
            }),
            filter((x) => {
              // Only return the first parent
              const parent = event[metadataSymbol].parentNoteId
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
              const relayHints = metadata.relayHints

              if (ids.length) {
                return from(ids).pipe(
                  mergeMap((id) => {
                    return subscribeIdsFromQuotes(this.client, id, { relayHints }).pipe(
                      ofKind<NostrEventNote>([Kind.Text]),
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
            const root = event[metadataSymbol].rootNoteId
            if (root) {
              return merge(this.subNotesWithRelated({ ids: [root] }), this.subReplies(root))
            }
            return EMPTY
          }),
        ),
      )
    })
  }

  withRelatedAuthors() {
    return connect((shared$: Observable<NostrEventNote>) => {
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
    return this.client.subscribe(filters, options).pipe(ofKind<NostrEventNote>(filters.kinds || []))
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
