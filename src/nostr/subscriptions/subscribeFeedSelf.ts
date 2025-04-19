import type { PaginationSubject } from '@/core/PaginationSubject'
import { mergeMap } from 'rxjs'
import type { NostrContext } from '../context'
import type { FeedOptions } from './subscribeFeed'
import { subscribeFeed } from './subscribeFeed'

export function subscribeFeedSelf(filter$: PaginationSubject, ctx: NostrContext, options: FeedOptions) {
  return filter$.$.pipe(mergeMap((filter) => subscribeFeed(filter, ctx, options)))
}
