import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { NostrEvent } from 'nostr-tools'
import { connect, ignoreElements, merge, mergeMap, of } from 'rxjs'
import type { NostrContext } from '../context'
import { parseId } from '../helpers/parseId'
import { ShareReplayCache } from '../replay'
import { type NostrEventNote, type NostrEventRepost, type NostrEventZapReceipt } from '../types'
import { subscribe } from './subscribe'
import { withRepostedEvent } from './subscribeReposts'
import { subscribeThreads } from './subscribeThreads'
import { withZapAuthor } from './subscribeZaps'
import { withRelatedAuthors } from './withRelatedAuthor'
import { withRelatedNotes } from './withRelatedNotes'

export const replayIds = new ShareReplayCache<NostrEvent>()

export const subscribeIds = replayIds.wrap((id: string, ctx: NostrContext) => {
  return subscribe(parseId(id), ctx).pipe(
    mergeMap((event) => {
      // Attach related pipelines based on kind
      switch (event.kind) {
        case Kind.Text:
        case Kind.Article: {
          return of(event).pipe(
            ofKind<NostrEventNote>([Kind.Text, Kind.Article]),
            withRelatedNotes(ctx),
            connect((shared$) => merge(shared$, shared$.pipe(subscribeThreads(ctx), ignoreElements()))),
          )
        }
        case Kind.Repost: {
          return of(event).pipe(ofKind<NostrEventRepost>([Kind.Repost]), withRepostedEvent(ctx))
        }
        case Kind.ZapReceipt: {
          return of(event).pipe(ofKind<NostrEventZapReceipt>([Kind.ZapReceipt]), withZapAuthor(ctx))
        }
        default: {
          // generic event (always get the author)
          return of(event).pipe(withRelatedAuthors(ctx))
        }
      }
    }),
  )
})
