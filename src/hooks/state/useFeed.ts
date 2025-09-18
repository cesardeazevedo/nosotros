import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { dedupeById } from '@/utils/utils'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { strictDeepEqual } from 'fast-equals'
import { useObservable, useObservableCallback, useSubscription } from 'observable-hooks'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { EMPTY, finalize, ignoreElements, filter as rxFilter, switchMap, tap, throttleTime } from 'rxjs'
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
  const [autoUpdate, setAutoUpdate] = useState(options.autoUpdate ?? false)

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
  const onStream = useCallback(
    (event: NostrEventDB) => {
      if (autoUpdate) {
        return addNewEvents([event])
      }
      if (event.metadata?.isRoot || event.kind !== Kind.Text) {
        setBuffer((events) => [...events, event])
      } else {
        setBufferReplies((events) => [...events, event])
      }
    },
    [autoUpdate],
  )

  const sub = useObservable<void, [FeedModule, NostrFilter, (event: NostrEventDB) => void]>(
    (input$) =>
      input$.pipe(
        switchMap(([options, filter, onStream]) => {
          if (options.live !== false) {
            return subscribeLive(options.ctx, options.scope, filter).pipe(
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
    [options, filter, onStream],
  )
  useSubscription(sub)

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
                    return !replies
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

  const [isEmpty, setIsEmpty] = useState(false)

  useEffect(() => {
    setIsEmpty(false)
    const timer = setTimeout(() => {
      const count = query.data?.pages?.[0]?.length ?? 0
      setIsEmpty(count === 0)
    }, 6000)
    return () => clearTimeout(timer)
  }, [query.data?.pages?.[0]])

  const addNewEvents = useCallback(
    (events: NostrEventDB[]) => {
      queryClient.setQueryData(queryKey, (older: InfiniteEvents | undefined) => {
        const sorted = events.sort((a, b) => b.created_at - a.created_at)
        return {
          pageParams: older?.pageParams || { limit: filter.limit },
          pages: [dedupeById([...sorted, ...(older?.pages?.[0] || [])]), ...(older?.pages?.slice(1) || [])],
        } as InfiniteEvents
      })
    },
    [queryClient],
  )

  const flush = useCallback(() => {
    if (replies) {
      addNewEvents(bufferReplies)
      setBufferReplies([])
    } else {
      addNewEvents(buffer)
      setBuffer([])
    }
  }, [replies, buffer, bufferReplies, setBuffer, setBufferReplies, addNewEvents])

  useEffect(() => {
    flush()
  }, [replies, autoUpdate])

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

  const [paginate, paginate$] = useObservableCallback<[number, InfiniteEvents | undefined, FeedScope]>((input$) => {
    return input$.pipe(
      rxFilter(([, data]) => data?.pages.flat().length !== 0),
      tap(([pageSize, data]) => {
        const total = data?.pages.flat().length || 0
        if (pageSize < total) {
          setPageSize(pageSize + (options.pageSize || 10))
        }
      }),
      rxFilter(([pageSize, data, scope]) => {
        const total = data?.pages.flat().length || 0
        return pageSize >= total && scope !== 'sets_e'
      }),
      throttleTime(1000, undefined, { leading: true, trailing: true }),
      tap(() => query.fetchNextPage()),
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
    autoUpdate,
    setAutoUpdate,
    flush,
    hasKind,
    toggleKind,
    resetFilter,
    resetBuffers,
    blured,
    setBlured,
    pageSize,
    setPageSize,
    isEmpty,
    setIsEmpty,
    paginate: () => paginate([pageSize, query.data, options.scope]),
    addRelay: () => {},
    removeRelay: () => {},
  }
}
