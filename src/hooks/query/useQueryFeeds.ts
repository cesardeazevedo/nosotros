import { settingsAtom } from '@/atoms/settings.atoms'
import { store } from '@/atoms/store'
import type { NostrFilter } from '@/core/types'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { NostrContext } from '@/nostr/context'
import { dedupeById } from '@/utils/utils'
import type { InfiniteData, UseInfiniteQueryOptions } from '@tanstack/react-query'
import { infiniteQueryOptions } from '@tanstack/react-query'
import { concatMap, EMPTY, firstValueFrom, map, mergeMap, of, shareReplay, tap, timer } from 'rxjs'
import type { Module } from '../modules/module'
import { subscribeFeed } from '../subscriptions/subscribeFeed'
import { queryClient } from './queryClient'
import { setEventData } from './queryUtils'

export type FeedScope =
  | 'self'
  | 'following'
  | 'sets_p'
  | 'sets_e'
  | 'relay_sets'
  | 'followers'
  | 'network'
  | 'global'
  | 'wot'

export type FeedModule = Module & {
  scope: FeedScope
  live?: boolean
  blured?: boolean
  pageSize?: number
  includeReplies?: boolean
  autoUpdate?: boolean
}

type PageParam = {
  limit: number
  until?: number
}

export type InfiniteEvents = InfiniteData<NostrEventDB[], unknown>

export type UseFeedQueryOptionsWithFilter<Select = InfiniteEvents> = UseInfiniteQueryOptions<
  NostrEventDB[],
  Error,
  Select
> &
  FeedModule & {
    onStream?: (event: NostrEventDB) => void
  }

export function createFeedQueryOptions(
  options: Omit<UseFeedQueryOptionsWithFilter, 'initialPageParam' | 'getNextPageParam'>,
) {
  const { filter, ctx, ...rest } = options
  const limit = filter.limit || 50
  return infiniteQueryOptions({
    queryFn: async (queryFn) => {
      const pageParam = queryFn.pageParam as PageParam
      const filter = { ...options.filter, ...pageParam } as NostrFilter
      const isFirstPage = !('until' in (pageParam as PageParam))
      const network = options.ctx.network || (isFirstPage ? 'STALE_WHILE_REVALIDATE' : 'CACHE_ONLY')

      const ctx = {
        ...options.ctx,
        subId: options.type,
        network,
        closeOnEose: true,
        maxRelaysPerUser: store.get(settingsAtom).maxRelaysPerUser,
      } as NostrContext

      const $ = subscribeFeed(ctx, options.scope, filter).pipe(
        // Remove annoying "future posts" spammers (we are adding a 2 second margin)
        map((res) => res.filter((x) => x.created_at <= (Date.now() + 2000) / 1000)),

        concatMap((res) => {
          const data = queryClient.getQueryData(options.queryKey) as InfiniteEvents | undefined
          const feedEmpty = data ? data.pages.flat().length === 0 : true

          if (feedEmpty && res.length === 0 && network !== 'REMOTE_ONLY') {
            // Feed is empty, fetch the database again
            return timer(3500).pipe(
              mergeMap(() => subscribeFeed({ ...options.ctx, network: 'CACHE_ONLY' }, options.scope, filter)),
            )
          } else if (!feedEmpty && isFirstPage && network !== 'CACHE_ONLY') {
            return timer(1500).pipe(
              mergeMap(() => {
                const data = queryClient.getQueryData(options.queryKey) as InfiniteEvents | undefined
                const top = data?.pages[0][0].created_at || 0
                dedupeById([...(data?.pages.flat() || []), ...res])
                  .filter((x) => x.created_at > top && x.created_at < (Date.now() + 1000) / 1000)
                  .forEach((x) => {
                    options.onStream?.(x)
                  })
                return EMPTY
              }),
            )
          }
          return of(res)
        }),

        tap((events) => events.forEach(setEventData)),

        // keep the stream running, otherwise firstValueFrom will terminate
        shareReplay(),
      )
      return await firstValueFrom($)
    },
    initialPageParam: { limit },
    getNextPageParam: (lastPage) => {
      if (!lastPage.length) return undefined
      const oldest = lastPage[lastPage.length - 1]
      return { limit, until: oldest.created_at - 1 } as PageParam
    },
    ...rest,
  })
}
