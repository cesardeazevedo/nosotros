import type { NostrFilter } from '@/core/types'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { NostrContext } from '@/nostr/context'
import type { InfiniteData, UseInfiniteQueryOptions } from '@tanstack/react-query'
import { infiniteQueryOptions } from '@tanstack/react-query'
import { concatMap, firstValueFrom, ignoreElements, mergeMap, mergeWith, of, shareReplay, tap, timer } from 'rxjs'
import type { Module } from '../modules/module'
import { subscribeFeed } from '../subscriptions/subscribeFeed'
import { subscribeLive } from '../subscriptions/subscribeLive'
import { setEventData } from './queryUtils'
import { queryClient } from './queryClient'

export type FeedScope = 'self' | 'following' | 'sets_p' | 'sets_e' | 'followers' | 'network' | 'global' | 'wot'

export type FeedModule = Module & {
  scope: FeedScope
  live?: boolean
  blured?: boolean
  includeReplies?: boolean
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
  const limit = filter.limit || 40
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
      } as NostrContext

      const $ = subscribeFeed(ctx, options.scope, filter).pipe(
        mergeWith(subscribeLive(ctx, filter, options).pipe(tap(options.onStream), ignoreElements())),

        concatMap((res) => {
          const data = queryClient.getQueryData(options.queryKey) as InfiniteEvents | undefined
          const feedEmpty = data ? data.pages.flat().length === 0 : true

          if (feedEmpty && res.length === 0 && network !== 'REMOTE_ONLY') {
            // Feed is empty, fetch the database again
            return timer(4500).pipe(
              mergeMap(() => {
                return subscribeFeed({ ...options.ctx, network: 'CACHE_ONLY' }, options.scope, filter)
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
    meta: {},
    ...rest,
  })
}
