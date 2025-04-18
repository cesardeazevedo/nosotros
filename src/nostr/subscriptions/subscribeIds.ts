import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { NostrEvent } from 'nostr-tools'
import { connect, ignoreElements, merge, mergeMap, of } from 'rxjs'
import type { NostrContext } from '../context'
import { ShareReplayCache } from '../replay'
import { subscribe } from './subscribe'
import { withRepostedEvent } from './subscribeReposts'
import { subscribeThreads } from './subscribeThreads'
import { withZapAuthor } from './subscribeZaps'
import { withRelatedAuthors } from './withRelatedAuthor'
import { withRelatedNotes } from './withRelatedNotes'

export const replayIds = new ShareReplayCache<NostrEvent>()

export const subscribeIds = (filter: NostrFilter, ctx: NostrContext) => {
  return subscribe(filter, ctx).pipe(
    mergeMap((event) => {
      // Attach related pipelines based on kind
      switch (event.kind) {
        case Kind.Text:
        case Kind.Article: {
          return of(event).pipe(
            withRelatedNotes(ctx),
            connect((shared$) => merge(shared$, shared$.pipe(subscribeThreads(ctx), ignoreElements()))),
          )
        }
        case Kind.Repost: {
          return of(event).pipe(withRepostedEvent(ctx))
        }
        case Kind.ZapReceipt: {
          return of(event).pipe(withZapAuthor(ctx))
        }
        default: {
          // generic event (always get the author)
          return of(event).pipe(withRelatedAuthors(ctx))
        }
      }
    }),
  )
}
