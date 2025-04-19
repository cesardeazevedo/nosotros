import type { PaginationSubject } from '@/core/PaginationSubject'
import { mergeMap } from 'rxjs'
import type { NostrContext } from '../context'
import type { FeedOptions } from './subscribeFeed'
import { subscribeFeed } from './subscribeFeed'
import { subscribeFollowSets } from './subscribeFollows'

export function subscribeFeedFollowSet(filter$: PaginationSubject, ctx: NostrContext, options?: FeedOptions) {
  return subscribeFollowSets(filter$.value, ctx).pipe(
    mergeMap((event) => {
      const pTags = event.tags.filter((x) => x[0] === 'p').map((x) => x[1]) || []
      return filter$.setFilter({ authors: [event.pubkey, ...pTags] })
    }),
    mergeMap((filter) => {
      const { '#d': d, ...rest } = filter
      return subscribeFeed({ ...rest }, ctx, options)
    }),
  )
}
