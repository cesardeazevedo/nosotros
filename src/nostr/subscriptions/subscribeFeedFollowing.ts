import type { PaginationLimitSubject } from '@/core/PaginationLimitSubject'
import type { PaginationSubject } from '@/core/PaginationRangeSubject'
import { mergeMap } from 'rxjs'
import type { NostrClient } from '../nostr'
import { metadataSymbol } from '../types'
import type { FeedOptions } from './subscribeFeed'
import { subscribeFeed } from './subscribeFeed'
import { subscribeFollows } from './subscribeFollows'

type Pagination = PaginationSubject | PaginationLimitSubject

export function subscribeFeedFollowing(pagination$: Pagination, client: NostrClient, options?: FeedOptions) {
  const currentAuthor = pagination$.authors[0]
  return subscribeFollows(currentAuthor, client, { ...options, prune: false }).pipe(
    mergeMap((event) => {
      const authors = [currentAuthor, ...(event[metadataSymbol].tags.get('p') || [])]
      return pagination$.setFilter({ authors })
    }),
    mergeMap((filter) => subscribeFeed(filter, client, options)),
  )
}
