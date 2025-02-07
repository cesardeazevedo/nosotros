import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import { connect, EMPTY, ignoreElements, merge, mergeMap, of } from 'rxjs'
import { parseId } from '../helpers/parseId'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { subscribeUser } from '../subscriptions/subscribeUser'
import { withZapAuthor } from '../subscriptions/subscribeZaps'
import type { NostrEventNote, NostrEventZapReceipt } from '../types'
import { replayIds } from './subscribeIds'

// Sligly different than subscribeIds but avoids circular references
export const subscribeIdsFromQuotes = replayIds.wrap((id: string, client: NostrClient, options?: ClientSubOptions) => {
  const filter = parseId(id)
  return client.subscribe(filter, options).pipe(
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
          return of(event).pipe(ofKind<NostrEventZapReceipt>([Kind.ZapReceipt]), withZapAuthor(client))
        }
        default: {
          // generic event (always get the author)
          return of(event).pipe(
            connect((shared) => {
              return merge(
                shared,
                shared.pipe(
                  mergeMap(() => subscribeUser(event.pubkey, client)),
                  ignoreElements(),
                ),
              )
            }),
          )
        }
      }
    }),
  )
})
