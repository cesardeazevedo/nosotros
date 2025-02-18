import type { PaginationLimitSubject } from '@/core/PaginationLimitSubject'
import type { PaginationSubject } from '@/core/PaginationRangeSubject'
import { mergeMap } from 'rxjs'
import type { NostrContext } from '../context'
import type { FeedOptions } from './subscribeFeed'
import { subscribeFeed } from './subscribeFeed'

type Pagination = PaginationSubject | PaginationLimitSubject

export function subscribeFeedSelf(filter$: Pagination, ctx: NostrContext, options: FeedOptions) {
  return filter$.pipe(mergeMap((filter) => subscribeFeed(filter, ctx, options)))
}
