import { Kind } from 'constants/kinds'
import type { SubscriptionOptions } from 'core/NostrSubscription'
import { batcher } from 'nostr/batcher'
import type { NostrClient } from 'nostr/nostr'
import { insertEvent } from 'nostr/operators/insertEvent'
import { onNewEvents } from 'nostr/operators/onNewEvents'
import { withCache } from 'nostr/operators/queryCache'
import { connect, ignoreElements, map, merge, mergeMap, of, tap } from 'rxjs'
import Follows from 'stores/models/follow'
import { followsStore } from 'stores/nostr/follows.store'

export class NIP02Follows {
  constructor(private client: NostrClient) {}

  subscribe(authors: string[] = [], options?: SubscriptionOptions) {
    const filter = { kinds: [Kind.Follows], authors }
    const sub = this.client.subscribe(filter, options)

    return of(sub).pipe(
      batcher.subscribe(),

      onNewEvents(sub),

      insertEvent(),

      withCache([filter]),

      map((event) => new Follows(event)),

      connect((shared$) => {
        return merge(
          shared$,
          shared$.pipe(
            // map((event) => this.parseFollowingTags(event.tags)),
            mergeMap((data) => this.client.users.subscribe([...data.authors])),
            ignoreElements(),
          ),
        )
      }),

      tap((event) => followsStore.add(event)),
    )
  }
}
