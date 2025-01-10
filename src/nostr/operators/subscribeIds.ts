import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import { connect, ignoreElements, merge, mergeMap, of } from 'rxjs'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { type NostrEventNote, type NostrEventRepost, type NostrEventZapReceipt } from '../types'

export function subscribeIds(client: NostrClient, id: string, options: ClientSubOptions) {
  return client.subscribe({ ids: [id] }, options).pipe(
    mergeMap((event) => {
      // Attach related pipelines based on kind
      switch (event.kind) {
        case Kind.Text:
        case Kind.Article: {
          return of(event).pipe(
            ofKind<NostrEventNote>([Kind.Text, Kind.Article]),
            client.notes.withRelatedNotes(),
            connect((shared$) => merge(shared$, shared$.pipe(client.notes.withThreads(), ignoreElements()))),
          )
        }
        case Kind.Repost: {
          return of(event).pipe(ofKind<NostrEventRepost>([Kind.Repost]), client.reposts.withRelatedEvent())
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
