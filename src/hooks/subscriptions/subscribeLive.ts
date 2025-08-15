import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '@/nostr/context'
import { delay, EMPTY, identity, mergeMap, filter as rxFilter, tap } from 'rxjs'
import { queryClient } from '../query/queryClient'
import type { FeedModule, InfiniteEvents } from '../query/useQueryFeeds'
import { subscribeFeed } from './subscribeFeed'

export function subscribeLive(ctx: NostrContext, filter: NostrFilter, options: FeedModule) {
  if (options.live === false || 'until' in filter) {
    return EMPTY
  }
  return subscribeFeed(
    {
      ...ctx,
      closeOnEose: false,
      negentropy: false,
      subId: 'live',
      network: 'REMOTE_ONLY',
    },
    options.scope,
    {
      ...filter,
      since: parseInt((Date.now() / 1000).toString()),
    },
  ).pipe(
    delay(1000),
    mergeMap(identity),
    rxFilter((event) => {
      const data = queryClient.getQueryData(options.queryKey) as InfiniteEvents | undefined
      const top = data?.pages[0][0].created_at || 0
      return event.created_at > top
    }),
    tap((x) => console.log('STREAM', x)),
  )
}
