import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { NostrContext } from '@/nostr/context'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { strictDeepEqual } from 'fast-equals'
import { useObservable, useObservableCallback, useSubscription } from 'observable-hooks'
import { useCallback, useMemo, useState } from 'react'
import { EMPTY, finalize, ignoreElements, switchMap, tap, throttleTime } from 'rxjs'
import { queryKeys } from '../query/queryKeys'
import { setEventData } from '../query/queryUtils'
import type { FeedScope } from '../query/useQueryFeeds'
import { createFeedQueryOptions, type FeedModule, type InfiniteEvents } from '../query/useQueryFeeds'
import { subscribeLive } from '../subscriptions/subscribeLive'

export type FeedState = ReturnType<typeof useFeedState>

export function useFeedState(options: FeedModule & { select?: (data: InfiniteEvents) => InfiniteEvents }) {
  const [filter, setFilter] = useState(options.filter)
  const [prevFilter, setPrevFilter] = useState(options.filter)
  const [replies, setReplies] = useState<boolean | undefined>(options.includeReplies)
  const [prevReplies, setPrevReplies] = useState<boolean | undefined>(options.includeReplies)

  const [blured, setBlured] = useState(options.blured ?? false)
  const [buffer, setBuffer] = useState<NostrEventDB[]>([])
  const [bufferReplies, setBufferReplies] = useState<NostrEventDB[]>([])
  const [pageSize, setPageSize] = useState(options.pageSize || 10)

  if (!strictDeepEqual(prevFilter, options.filter)) {
    setPrevFilter(filter)
    setFilter(options.filter)
  }
  if (prevReplies !== options.includeReplies) {
    setPrevReplies(replies)
    setReplies(options.includeReplies)
  }

  const sub = useObservable<void, [NostrContext, FeedScope, NostrFilter]>(
    (input$) =>
      input$.pipe(
        switchMap(([ctx, scope, filter]) => {
          if (options.live !== false) {
            return subscribeLive(ctx, scope, filter).pipe(
              tap((event) => {
                setEventData(event)
                onStream(event)
              }),
              ignoreElements(),
              finalize(() => flush()),
            )
          }
          return EMPTY
        }),
      ),
    [options.ctx, options.scope, filter],
  )
  useSubscription(sub)

  const onStream = useCallback((event: NostrEventDB) => {
    if (event.metadata?.isRoot) {
      setBuffer((events) => [...events, event])
    } else {
      setBufferReplies((events) => [...events, event])
    }
  }, [])

  const queryClient = useQueryClient()
  const queryKey = queryKeys.feed(options.id, filter, options.ctx)
  const query = useInfiniteQuery(
    createFeedQueryOptions({
      select: useCallback(
        (data: InfiniteEvents) => {
          return {
            pages: data.pages.map((page = []) =>
              page.filter((event) => {
                switch (event.kind) {
                  case Kind.Text: {
                    if (replies !== undefined) {
                      return replies ? !event.metadata?.isRoot : event.metadata?.isRoot
                    }
                    return true
                  }
                  case Kind.Repost: {
                    return !replies
                  }
                  default: {
                    return true
                  }
                }
              }),
            ),
            pageParams: data.pageParams,
          }
        },
        [replies],
      ),
      ...options,
      filter,
      queryKey,
      onStream,
    }),
  )

  const flush = () => {
    queryClient.setQueryData(queryKey, (older: InfiniteEvents | undefined) => {
      const ids = new Set(older?.pages.flat().map((x) => x.id))
      const bufferData = replies ? bufferReplies : buffer
      const sorted = bufferData.filter((x) => !ids.has(x.id)).sort((a, b) => b.created_at - a.created_at)
      return {
        pageParams: older?.pageParams || { limit: filter.limit },
        pages: [[...sorted, ...(older?.pages?.[0] || [])], ...(older?.pages?.slice(1) || [])],
      } as InfiniteEvents
    })
    if (replies) {
      setBufferReplies([])
    } else {
      setBuffer([])
    }
  }

  const bufferTotal = useMemo(() => buffer.length, [buffer])
  const bufferTotalReplies = useMemo(() => bufferReplies.length, [bufferReplies])
  const bufferPubkeys = useMemo(() => buffer.slice(0, 3).map((event) => event.pubkey), [buffer])
  const bufferPubkeysReplies = useMemo(() => bufferReplies.slice(0, 3).map((event) => event.pubkey), [bufferReplies])

  const resetBuffers = useCallback(() => {
    if (replies === true) {
      setBufferReplies([])
    } else if (replies === false) {
      setBuffer([])
    } else {
      setBuffer([])
      setBufferReplies([])
    }
  }, [replies])

  const hasKind = useCallback((kind: Kind) => filter.kinds?.includes(kind), [filter])
  const toggleKind = useCallback(
    (kind: Kind) =>
      setFilter((prev) => ({
        ...prev,
        kinds: (prev.kinds || []).includes(kind)
          ? prev.kinds?.filter((k) => k !== kind)
          : [...(prev.kinds || []), kind],
      })),
    [],
  )

  const resetFilter = useCallback(() => setFilter(options.filter), [options.filter])

  const [paginate, paginate$] = useObservableCallback<[number, InfiniteEvents | undefined]>((input$) => {
    return input$.pipe(
      throttleTime(1200, undefined, { leading: true, trailing: true }),
      tap(([pageSize, data]) => {
        if (pageSize < (data?.pages.flat().length || 0)) {
          setPageSize(pageSize + 10)
        } else {
          query.fetchNextPage()
        }
      }),
    )
  })
  useSubscription(paginate$)

  return {
    query,
    queryKey,
    options,
    filter,
    type: options.type,
    setFilter,
    replies,
    setReplies,
    bufferPubkeys,
    bufferPubkeysReplies,
    bufferTotal,
    bufferTotalReplies,
    flush,
    hasKind,
    toggleKind,
    resetFilter,
    resetBuffers,
    blured,
    setBlured,
    pageSize,
    setPageSize,
    paginate: () => paginate([pageSize, query.data]),
    addRelay: () => {},
    removeRelay: () => {},
  }
}
