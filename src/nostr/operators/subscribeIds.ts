import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { NostrEvent } from 'nostr-tools'
import { connect, ignoreElements, merge, mergeMap, of } from 'rxjs'
import { parseId } from '../helpers/parseId'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { ShareReplayCache } from '../replay'
import { withRepostedEvent } from '../subscriptions/subscribeReposts'
import { subscribeThreads } from '../subscriptions/subscribeThreads'
import { withZapAuthor } from '../subscriptions/subscribeZaps'
import { withRelatedAuthors } from '../subscriptions/withRelatedAuthor'
import { withRelatedNotes } from '../subscriptions/withRelatedNotes'
import { type NostrEventNote, type NostrEventRepost, type NostrEventZapReceipt } from '../types'

export const replayIds = new ShareReplayCache<NostrEvent>()

export const subscribeIds = replayIds.wrap((id: string, client: NostrClient, options?: ClientSubOptions) => {
  return client.subscribe(parseId(id), options).pipe(
    mergeMap((event) => {
      // Attach related pipelines based on kind
      switch (event.kind) {
        case Kind.Text:
        case Kind.Article: {
          return of(event).pipe(
            ofKind<NostrEventNote>([Kind.Text, Kind.Article]),
            withRelatedNotes(client),
            connect((shared$) => merge(shared$, shared$.pipe(subscribeThreads(client), ignoreElements()))),
          )
        }
        case Kind.Repost: {
          return of(event).pipe(ofKind<NostrEventRepost>([Kind.Repost]), withRepostedEvent(client))
        }
        case Kind.ZapReceipt: {
          return of(event).pipe(ofKind<NostrEventZapReceipt>([Kind.ZapReceipt]), withZapAuthor(client))
        }
        default: {
          // generic event (always get the author)
          return of(event).pipe(withRelatedAuthors(client))
        }
      }
    }),
  )
})
