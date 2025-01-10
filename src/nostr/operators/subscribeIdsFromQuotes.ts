import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import { connect, EMPTY, ignoreElements, merge, mergeMap, of } from 'rxjs'
import type { ClientSubOptions, NostrClient } from '../nostr'
import type { NostrEventNote, NostrEventZapReceipt } from '../types'

// Sligly different than subscribeIds but avoids circular references
export function subscribeIdsFromQuotes(client: NostrClient, id: string, options: ClientSubOptions) {
  return client.subscribe({ ids: [id] }, options).pipe(
    mergeMap((event) => {
      switch (event.kind) {
        case Kind.Text:
        case Kind.Article: {
          return of(event).pipe(ofKind<NostrEventNote>([Kind.Text, Kind.Article]), client.notes.withRelatedAuthors())
        }
        // kind 6 reposts shouldn't be quoted
        case Kind.Repost: {
          return EMPTY
        }
        case Kind.ZapReceipt: {
          return of(event).pipe(ofKind<NostrEventZapReceipt>([Kind.ZapReceipt]), client.zaps.withRelatedAuthors())
        }
        default: {
          // generic event (always get the author)
          return of(event).pipe(
            connect((shared) => {
              return merge(
                shared,
                shared.pipe(
                  mergeMap(() => client.users.subscribe(event.pubkey)),
                  ignoreElements(),
                ),
              )
            }),
          )
        }
      }
    }),
  )
}
