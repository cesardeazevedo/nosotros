import { Kind } from 'constants/kinds'
import type { SubscriptionOptions } from 'core/NostrSubscription'
import type { PaginationSubject } from 'core/PaginationSubject'
import { from, mergeMap } from 'rxjs'
import type { NostrClient } from './nostr'

export class NostrFeeds {
  constructor(private client: NostrClient) { }

  subscribe(filter$: PaginationSubject, options?: SubscriptionOptions) {
    return from(filter$).pipe(
      mergeMap((filter) => {
        return this.client.notes.subWithRelated(filter, options)
      })
    )
  }

  subscribeFromFollows(pagination$: PaginationSubject, options?: SubscriptionOptions) {
    return this.client.follows.subscribe(pagination$.initialValue.authors, options).pipe(
      // Set the filter authors with the `follows` list
      mergeMap((follows) => {
        return pagination$.setFilter({
          kinds: [Kind.Text, Kind.Article],
          authors: [...follows.authors],
        })
      }),
      // Start notes subscription
      mergeMap((filter) => {
        return this.client.notes.subWithRelated(filter, options)
      }),
    )
  }
}
