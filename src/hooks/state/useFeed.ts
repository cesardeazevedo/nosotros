import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { strictDeepEqual } from 'fast-equals'
import { useObservableCallback, useSubscription } from 'observable-hooks'
import { useCallback, useMemo, useState } from 'react'
import { tap, throttleTime } from 'rxjs'
import { queryKeys } from '../query/queryKeys'
import { createFeedQueryOptions, type FeedModule, type InfiniteEvents } from '../query/useQueryFeeds'

export type FeedState = ReturnType<typeof useFeedState>

export function useFeedState(options: FeedModule & { select?: (data: InfiniteEvents) => InfiniteEvents }) {
  const [filter, setFilter] = useState(options.filter)
  const [replies, setReplies] = useState<boolean | undefined>(options.includeReplies ?? false)
  const [blured, setBlured] = useState(options.blured ?? false)
  const [buffer, setBuffer] = useState<NostrEventDB[]>([])
  const [bufferReplies, setBufferReplies] = useState<NostrEventDB[]>([])

  // In case the filter was updated from the router
  if (!strictDeepEqual(filter, options.filter)) {
    setFilter(options.filter)
  }

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
                    return replies ? !event.metadata?.isRoot : event.metadata?.isRoot
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
      onStream: (event) => {
        if (event.metadata?.isRoot) {
          setBuffer((events) => [...events, event])
        } else {
          setBufferReplies((events) => [...events, event])
        }
      },
    }),
  )

  const flush = () => {
    queryClient.setQueryData(queryKey, (older: InfiniteEvents | undefined) => {
      const bufferData = replies ? bufferReplies : buffer
      const sorted = bufferData.sort((a, b) => b.created_at - a.created_at)
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

  const [paginate, paginate$] = useObservableCallback<void, void>((input$) => {
    return input$.pipe(
      throttleTime(1500, undefined, { leading: true, trailing: true }),
      tap(() => query.fetchNextPage()),
    )
  })
  useSubscription(paginate$)

  return {
    query,
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
    blured,
    setBlured,
    paginate: () => paginate(),
    addRelay: () => {},
    removeRelay: () => {},
  }
}
