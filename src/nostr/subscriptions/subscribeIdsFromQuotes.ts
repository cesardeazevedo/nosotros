import { Kind } from '@/constants/kinds'
import type { NostrEvent } from 'nostr-tools'
import { connect, EMPTY, ignoreElements, merge, mergeMap, of } from 'rxjs'
import type { NostrContext } from '../context'
import { parseId } from '../helpers/parseId'
import { ShareReplayCache } from '../replay'
import { subscribe } from './subscribe'
import { withAuthorsFromNote } from './subscribeNoteAuthors'
import { subscribeUser } from './subscribeUser'
import { withZapAuthor } from './subscribeZaps'

export const replay = new ShareReplayCache<NostrEvent>()

// Sligly different than subscribeIds but avoids circular references
export const subscribeIdsFromQuotes = replay.wrap((id: string, ctx: NostrContext) => {
  const filter = parseId(id)
  return subscribe(filter, ctx).pipe(
    mergeMap((event) => {
      switch (event.kind) {
        case Kind.Text:
        case Kind.Article: {
          return of(event).pipe(withAuthorsFromNote(ctx))
        }
        // kind 6 reposts shouldn't be quoted
        case Kind.Repost: {
          return EMPTY
        }
        case Kind.ZapReceipt: {
          return of(event).pipe(withZapAuthor(ctx))
        }
        default: {
          // generic event (always get the author)
          return of(event).pipe(
            connect((shared) => {
              return merge(
                shared,
                shared.pipe(
                  mergeMap(() => subscribeUser(event.pubkey, ctx)),
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
