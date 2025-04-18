import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { Observable } from 'rxjs'
import { EMPTY, expand, filter, mergeMap, of } from 'rxjs'
import type { NostrContext } from '../context'
import type { NostrEventMetadata } from '../types'
import { metadataSymbol } from '../types'
import { subscribeIdsFromQuotes } from './subscribeIdsFromQuotes'
import { withRelatedNotes } from './withRelatedNotes'

export function subscribeParent(ctx: NostrContext) {
  return mergeMap((event: NostrEventMetadata): Observable<NostrEventMetadata> => {
    return of(event).pipe(
      expand((event, depth) => {
        if (depth > 1) {
          return EMPTY
        }
        const { parentId, relayHints } = event[metadataSymbol]
        if (parentId) {
          return subscribeIdsFromQuotes(parentId, { ...ctx, relayHints, queryDB: true }).pipe(
            // People are using NIP-10 replies to a bunch of crap
            ofKind([Kind.Text, Kind.Comment, Kind.Article]),
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
  })
}
