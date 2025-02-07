import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { Observable } from 'rxjs'
import { EMPTY, expand, filter, mergeMap, of } from 'rxjs'
import type { NostrClient } from '../nostr'
import { subscribeIdsFromQuotes } from './subscribeIdsFromQuotes'
import type { NostrEventComment, NostrEventNote } from '../types'
import { metadataSymbol } from '../types'
import { withRelatedNotes } from './withRelatedNotes'

type Note$ = Observable<NostrEventNote | NostrEventComment>

export function subscribeParent(client: NostrClient) {
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
              return subscribeIdsFromQuotes(parentId, client, { relayHints }).pipe(
                // People are using NIP-10 replies to a bunch of crap
                ofKind<NostrEventNote | NostrEventComment>([Kind.Text, Kind.Comment, Kind.Article]),
                withRelatedNotes(client),
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
