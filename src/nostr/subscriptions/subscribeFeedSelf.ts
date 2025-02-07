import type { PaginationLimitSubject } from '@/core/PaginationLimitSubject'
import type { PaginationSubject } from '@/core/PaginationRangeSubject'
import { mergeMap } from 'rxjs'
import type { NostrClient } from '../nostr'
import type { FeedOptions } from './subscribeFeed'
import { subscribeFeed } from './subscribeFeed'

type Pagination = PaginationSubject | PaginationLimitSubject

export function subscribeFeedSelf(filter$: Pagination, client: NostrClient, options?: FeedOptions) {
  return filter$.pipe(mergeMap((filter) => subscribeFeed(filter, client, options)))
}
