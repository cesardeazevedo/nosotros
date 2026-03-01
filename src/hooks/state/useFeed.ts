import type { FeedAtoms } from '@/atoms/modules.atoms'
import { createFeedAtoms } from '@/atoms/feed.atoms'
import { Kind } from '@/constants/kinds'
import { dedupe } from '@/core/helpers/dedupe'
import type { NostrFilter } from '@/core/types'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { NostrContext } from '@/nostr/context'
import { useQueryClient } from '@tanstack/react-query'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useObservable, useObservableCallback, useSubscription } from 'observable-hooks'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { EMPTY, filter as rxFilter, Subject, switchMap, tap, throttleTime } from 'rxjs'
import type { Modules } from '../modules/module'
import { queryKeys } from '../query/queryKeys'
import { prependEventFeed, setEventData } from '../query/queryUtils'
import type { FeedScope } from '../query/useQueryFeeds'
import { type FeedModule, type InfiniteEvents } from '../query/useQueryFeeds'
import { subscribeLive } from '../subscriptions/subscribeLive'

export const feedRefresh$ = new Subject<string>()

export type FeedState = ReturnType<typeof useFeedState>

export function useFeedStateAtom(feedAtoms: FeedAtoms) {
  const baseOptions = feedAtoms.options
  const sessionOptions = useAtomValue(feedAtoms.atom)

  const [filter, setFilter] = useAtom(feedAtoms.filter)
  const [autoUpdate, setAutoUpdate] = useAtom(feedAtoms.autoUpdate)
  const [blured, setBlured] = useAtom(feedAtoms.blured)
  const [replies, setReplies] = useAtom(feedAtoms.includeReplies)
  const [buffer = [], setBuffer] = useAtom(feedAtoms.buffer)
  const [bufferReplies = [], setBufferReplies] = useAtom(feedAtoms.bufferReplies)
  const [pageSize = 10, setPageSize] = useAtom(feedAtoms.pageSize)

  const isDirty = useAtomValue(feedAtoms.isDirty)
  const isModified = useAtomValue(feedAtoms.isModified)
  const saveFeed = useSetAtom(feedAtoms.save)
  const resetFeed = useSetAtom(feedAtoms.reset)

  const syncOptions = useSetAtom(feedAtoms.sync)
  const setOptions = useSetAtom(feedAtoms.atom)

  // sync changes from options, these changes comes from url router
  useEffect(() => {
    syncOptions(baseOptions)
  }, [baseOptions.filter, baseOptions.includeReplies, syncOptions])

  const onStream = useCallback(
    (event: NostrEventDB) => {
      if (autoUpdate) {
        return addNewEvents([event])
      }
      if (event.metadata?.isRoot || event.kind !== Kind.Text) {
        setBuffer((events = []) => [...events, event])
      } else {
        setBufferReplies((events = []) => [...events, event])
      }
    },
    [autoUpdate],
  )

  const live$ = useObservable<NostrEventDB, [NostrContext, FeedScope, NostrFilter]>(
    (input$) =>
      input$.pipe(
        switchMap(([ctx, scope, filter]) => {
          if (sessionOptions.live !== false) {
            return subscribeLive(ctx, scope, filter)
          }
          return EMPTY
        }),
      ),
    [sessionOptions.ctx, sessionOptions.scope, filter],
  )
  useSubscription(live$, {
    next: (event) => {
      setEventData(event)
      onStream(event)
    },
    complete: () => {
      flush()
    },
  })

  const queryClient = useQueryClient()
  const queryKey = queryKeys.feed(sessionOptions.id, filter, sessionOptions.ctx)
  const query = useAtomValue(feedAtoms.query)
  const data = useAtomValue(feedAtoms.data)

  const [isEmpty, setIsEmpty] = useState(false)

  useEffect(() => {
    setIsEmpty(false)
    const timer = setTimeout(() => {
      const count = query.data?.pages?.[0]?.length ?? 0
      setIsEmpty(count === 0)
    }, 8000)
    return () => clearTimeout(timer)
  }, [query.data?.pages?.[0]])

  const addNewEvents = useCallback(
    (events: NostrEventDB[]) => {
      prependEventFeed(queryKey, events)
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

  const onRefresh = () => {
    queryClient.resetQueries({ queryKey })
    queryClient.invalidateQueries({ queryKey })
    setIsEmpty(false)
    resetBuffers()
  }

  const [paginate, paginate$] = useObservableCallback<[number, InfiniteEvents | undefined, FeedScope]>((input$) => {
    return input$.pipe(
      rxFilter(([, data]) => data?.pages.flat().length !== 0),
      tap(([pageSize, data]) => {
        const total = data?.pages.flat().length || 0
        if (pageSize < total) {
          setPageSize(pageSize + (sessionOptions.pageSize || 10))
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

  const refresh$ = useObservable(() =>
    feedRefresh$.pipe(
      rxFilter((x) => sessionOptions.id.startsWith(x)),
      tap(() => onRefresh()),
    ),
  )
  useSubscription(refresh$)

  return {
    atoms: feedAtoms,
    query,
    data,
    queryKey,
    options: sessionOptions,
    filter,
    isDirty,
    isModified,
    type: sessionOptions.type,
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
    resetFeed,
    resetBuffers,
    onRefresh,
    blured,
    setBlured,
    pageSize,
    setPageSize,
    saveFeed,
    isEmpty,
    setIsEmpty,
    onStream,
    paginate: () => paginate([pageSize, query.data, sessionOptions.scope]),
    addRelay: (relay: string) => {
      setOptions((prev: Modules) => {
        const relays = dedupe([...(prev.ctx?.relays || []), relay])
        return {
          ...prev,
          ctx: {
            ...prev.ctx,
            relays,
          },
        }
      })
    },
    removeRelay: (relay: string) => {
      setOptions((prev: Modules) => {
        const relays = (prev.ctx?.relays || []).filter((url: string) => url !== relay)
        return {
          ...prev,
          ctx: {
            ...prev.ctx,
            relays,
          },
        }
      })
    },
  }
}

export function useFeedState(module: FeedModule) {
  const feedAtoms = useMemo(() => createFeedAtoms(module), [module])
  return useFeedStateAtom(feedAtoms)
}
