import { Kind } from '@/constants/kinds'
import type { NostrContext } from '@/nostr/context'
import { isAuthorTag } from '@/nostr/helpers/parseTags'
import { subscribe } from '@/nostr/subscriptions/subscribe'
import { subscribeFollows } from '@/nostr/subscriptions/subscribeFollows'
import { withRelatedAuthors } from '@/nostr/subscriptions/withRelatedAuthor'
import { bufferTime, EMPTY, filter, merge, mergeMap, tap } from 'rxjs'
import { addNostrEventToStore } from '../helpers/addNostrEventToStore'
import { toStream } from '../helpers/toStream'
import { rootStore } from '../root.store'

export function subscribeLists() {
  const ctx: NostrContext = { ...rootStore.globalContext, queryDB: false, insertStore: false }
  return toStream(() => rootStore.auth.selected).pipe(
    mergeMap((user) =>
      merge(
        user
          ? subscribeFollows(user.pubkey, rootStore.globalContext).pipe(
              mergeMap((event) => {
                return subscribe(
                  {
                    kinds: [Kind.RelaySets, Kind.FollowSets],
                    authors: event.tags.filter(isAuthorTag).map((x) => x[1]),
                  },
                  { ...ctx, outbox: true },
                )
              }),
            )
          : EMPTY,
        subscribe(
          { kinds: [Kind.StarterPack], limit: 200 },
          {
            ...ctx,
            relays: [
              'wss://relay.damus.io',
              'wss://relay.nostr.band',
              'wss://nos.lol',
              'wss://nostr-pub.wellorder.net',
              'wss://relay.primal.net',
            ],
          },
        ).pipe(withRelatedAuthors(ctx)),
      ),
    ),
    bufferTime(2000),
    filter((x) => x.length > 0),
    tap((events) => {
      events.forEach((event) => {
        addNostrEventToStore(event)
      })
    }),
  )
}
