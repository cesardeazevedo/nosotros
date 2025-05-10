import type { PaginationSubject } from '@/core/PaginationSubject'
import { from, mergeMap } from 'rxjs'
import type { NostrContext } from '../context'
import type { FeedOptions } from './subscribeFeed'
import { subscribeFeed } from './subscribeFeed'
import { subscribeFollows } from './subscribeFollows'

export function subscribeFeedFollowing(filter$: PaginationSubject, ctx: NostrContext, options?: FeedOptions) {
  return from(filter$.authors).pipe(
    mergeMap((author) => subscribeFollows(author, ctx)),
    mergeMap((event) => {
      const pTags = event.tags.filter((x) => x[0] === 'p').map((x) => x[1]) || []
      return filter$.setFilter({ authors: [event.pubkey, ...pTags] })
    }),
    mergeMap((filter) => subscribeFeed(filter, ctx, options)),
  )
}
