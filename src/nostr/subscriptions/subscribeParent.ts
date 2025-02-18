import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { Observable } from 'rxjs'
import { EMPTY, expand, filter, mergeMap, of } from 'rxjs'
import type { NostrContext } from '../context'
import type { NostrEventComment, NostrEventNote } from '../types'
import { metadataSymbol } from '../types'
import { subscribeIdsFromQuotes } from './subscribeIdsFromQuotes'
import { withRelatedNotes } from './withRelatedNotes'

type Note$ = Observable<NostrEventNote | NostrEventComment>

export function subscribeParent(ctx: NostrContext) {
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
              return subscribeIdsFromQuotes(parentId, { ...ctx, subOptions: { relayHints } }).pipe(
                // People are using NIP-10 replies to a bunch of crap
                ofKind<NostrEventNote | NostrEventComment>([Kind.Text, Kind.Comment, Kind.Article]),
                withRelatedNotes(ctx),
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
