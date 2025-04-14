import { Kind } from '@/constants/kinds'
import { dedupe } from '@/core/helpers/dedupe'
import { mergeRelayHints } from '@/core/mergers/mergeRelayHints'
import { ofKind } from '@/core/operators/ofKind'
import { EMPTY, expand, from, mergeMap, of, skip } from 'rxjs'
import type { NostrContext } from '../context'
import type { NostrEventMetadata } from '../types'
import { metadataSymbol } from '../types'
import { subscribeIdsFromQuotes } from './subscribeIdsFromQuotes'
import { subscribeParent } from './subscribeParent'

export type QuoteOptions = {
  depth?: number
}

export function subscribeQuotes(ctx: NostrContext, options?: QuoteOptions) {
  const maxDepth = options?.depth || 16
  return mergeMap((event: NostrEventMetadata) => {
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
              const relayHints = mergeRelayHints([
                metadata.relayHints || {},
                {
                  ids: { [id]: ['wss://relay.nostr.band'] },
                  idHints: { [id]: dedupe([event.pubkey, metadata.mentionedAuthors?.[0]]) },
                },
              ])
              return subscribeIdsFromQuotes(id, {
                ...ctx,
                batcher: 'lazy',
                relayHints,
                outbox: true,
                queryDB: true,
              }).pipe(ofKind<NostrEventMetadata>([Kind.Text]), subscribeParent(ctx))
            }),
          )
        }
        return EMPTY
      }),
      skip(1), // skip the source
    )
  })
}
