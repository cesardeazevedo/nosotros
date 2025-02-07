import { Kind } from '@/constants/kinds'
import { mergeRelayHints } from '@/core/mergers/mergeRelayHints'
import { ofKind } from '@/core/operators/ofKind'
import type { Observable } from 'rxjs'
import { EMPTY, expand, from, mergeMap, of, skip } from 'rxjs'
import type { NostrClient } from '../nostr'
import { subscribeIdsFromQuotes } from '../operators/subscribeIdsFromQuotes'
import type { NostrEventComment, NostrEventNote } from '../types'
import { metadataSymbol } from '../types'
import { subscribeParent } from './subscribeParent'

export type Note$ = Observable<NostrEventNote | NostrEventComment>

export type QuoteOptions = {
  depth?: number
}

export function subscribeQuotes(client: NostrClient, options?: QuoteOptions) {
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
                  return subscribeIdsFromQuotes(id, client, { relayHints }).pipe(
                    ofKind<NostrEventNote>([Kind.Text]),
                    subscribeParent(client),
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
