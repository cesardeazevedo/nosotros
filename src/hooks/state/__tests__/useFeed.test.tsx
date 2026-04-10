import { store } from '@/atoms/store'
import type { ThreadGroup } from '@/atoms/threads.atoms'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { queryClient } from '@/hooks/query/queryClient'
import { queryKeys } from '@/hooks/query/queryKeys'
import type { FeedModule } from '@/hooks/query/useQueryFeeds'
import { test } from '@/utils/fixtures'
import type { QueryKey } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import type { RenderHookOptions } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react'
import { Provider as JotaiProvider } from 'jotai'
import { queryClientAtom } from 'jotai-tanstack-query'
import React, { useMemo } from 'react'
import { vi } from 'vitest'
import { useFeedState } from '../useFeed'
import { fakeEventMeta } from '@/utils/faker'

function createModule(id: string, extras?: Partial<FeedModule>): FeedModule {
  return {
    id,
    type: 'feed',
    filter: { kinds: [Kind.Text], limit: 10 },
    queryKey: ['feed', id] as unknown as QueryKey,
    ctx: {},
    scope: 'following',
    includeReplies: false,
    autoUpdate: false,
    blured: false,
    pageSize: 10,
    ...extras,
  }
}

function withProviders(children: React.ReactNode) {
  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider store={store}>{children}</JotaiProvider>
    </QueryClientProvider>
  )
}

describe('assert useFeedState minimal', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    store.set(queryClientAtom, queryClient)
  })

  test('assert sets isEmpty=true after 4s when first page is empty', async () => {
    const module = createModule('t1')

    const { result } = renderHook(() => useFeedState(module), {
      wrapper: ({ children }) => withProviders(children),
    })

    expect(result.current.isEmpty).toBe(false)
    act(() => vi.advanceTimersByTime(8000))

    expect(result.current.isEmpty).toBe(true)
  })

  test('assert toggleKind adds and removes kind', () => {
    const module = createModule('t2')

    const { result } = renderHook(() => useFeedState(module), {
      wrapper: ({ children }) => withProviders(children),
    })

    act(() => result.current.toggleKind(Kind.Repost))
    expect(result.current.filter.kinds).toEqual([Kind.Text, Kind.Repost])

    act(() => result.current.toggleKind(Kind.Repost))
    expect(result.current.filter.kinds).toEqual([Kind.Text])
  })

  test('assert feed replies updates after unmount', () => {
    type Props = { includeReplies: boolean }
    const hook = ({ includeReplies }: Props) => {
      const module = useMemo(() => createModule('home_unmount', { includeReplies }), [includeReplies])
      return useFeedState(module)
    }
    const options = (props: Props): RenderHookOptions<Props> => ({
      initialProps: props,
      wrapper: ({ children }) => withProviders(children),
    })
    const { result, unmount } = renderHook(hook, options({ includeReplies: false }))

    expect(result.current.filter.kinds).toEqual([Kind.Text])
    expect(result.current.replies).toEqual(false)

    unmount()

    const { result: result2 } = renderHook(hook, options({ includeReplies: true }))
    expect(result.current.filter.kinds).toEqual([Kind.Text])
    expect(result2.current.replies).toEqual(true)
  })

  describe('flush', () => {
    test('assert flush adds buffer events to feed', async () => {
      const module = createModule('feed_events')
      const event = fakeEventMeta({ kind: Kind.Text, id: '1', created_at: 1 })
      const feedQueryKey = queryKeys.feed(module.id, module.filter, module.ctx)
      queryClient.setQueryData(feedQueryKey, {
        pages: [[event]],
        pageParams: [undefined],
      })

      const { result } = renderHook(() => useFeedState(module), {
        wrapper: ({ children }) => withProviders(children),
      })

      await act(async () => {
        await vi.waitFor(() => {
          expect(result.current.data.pages[0]).toHaveLength(1)
        })
      })

      const initialPage = result.current.data.pages[0] as NostrEventDB[]
      expect(initialPage).toHaveLength(1)
      expect(initialPage[0].id).toBe('1')

      const root1 = fakeEventMeta({ kind: Kind.Text, id: '1', created_at: 1 })
      const root2 = fakeEventMeta({ kind: Kind.Text, id: '2', created_at: 2 })
      const root3 = fakeEventMeta({ kind: Kind.Text, id: '3', created_at: 3 })
      const repost1 = fakeEventMeta({ kind: Kind.Repost, id: '4', created_at: 4 })
      const reply1 = fakeEventMeta({ kind: Kind.Text, id: '5', created_at: 5, tags: [['e', '1', '', 'root']] })

      act(() => {
        result.current.onStream(root1)
        result.current.onStream(root2)
        result.current.onStream(root3)
        result.current.onStream(repost1)
        result.current.onStream(reply1)
      })

      expect(result.current.bufferTotalReplies).toBe(1)
      expect(result.current.bufferTotal).toBe(4)

      await act(async () => {
        result.current.flush()
      })

      expect(result.current.bufferTotal).toBe(0)
      const page = result.current.data.pages[0] as NostrEventDB[]
      expect(page).toHaveLength(4)
      expect(page[0].id).toBe('4')
      expect(page[1].id).toBe('3')
      expect(page[2].id).toBe('2')
      expect(page[3].id).toBe('1')
    })

    test('assert flush adds buffer replies to feed', async () => {
      const module = createModule('feed_replies', { includeReplies: true, type: 'inbox' })
      const reply = fakeEventMeta({ kind: Kind.Text, id: '1', created_at: 1, tags: [['e', '0', '', 'root']] })
      const feedQueryKey = queryKeys.feed(module.id, module.filter, module.ctx)
      queryClient.setQueryData(feedQueryKey, {
        pages: [[reply]],
        pageParams: [undefined],
      })

      const { result, rerender, unmount } = renderHook(() => useFeedState(module), {
        wrapper: ({ children }) => withProviders(children),
      })

      await act(async () => {
        await vi.waitFor(() => {
          expect(result.current.data.pages[0]).toHaveLength(1)
        })
      })

      const page = result.current.data.pages[0] as NostrEventDB[]
      expect(page).toHaveLength(1)
      expect(page[0].id).toBe('1')

      const reply1 = fakeEventMeta({ kind: Kind.Text, id: '2', created_at: 2, tags: [['e', '0', '', 'root']] })
      const reply2 = fakeEventMeta({ kind: Kind.Text, id: '3', created_at: 3, tags: [['e', '0', '', 'root']] })
      const reply3 = fakeEventMeta({ kind: Kind.Text, id: '4', created_at: 4, tags: [['e', '0', '', 'root']] })
      const rootEvent = fakeEventMeta({ kind: Kind.Text, id: '5', created_at: 5 })

      act(() => {
        result.current.onStream(reply1)
        result.current.onStream(reply2)
        result.current.onStream(reply3)
        result.current.onStream(rootEvent)
      })

      await vi.waitFor(() => {
        expect(result.current.bufferTotalReplies).toBe(3)
      })

      await act(async () => {
        rerender()
        result.current.flush()
      })

      await vi.waitFor(() => {
        expect(result.current.bufferTotalReplies).toBe(0)
      })

      unmount()
      const { result: result2 } = renderHook(() => useFeedState(module), {
        wrapper: ({ children }) => withProviders(children),
      })

      await vi.waitFor(() => {
        expect(result2.current.data.pages[0]).toHaveLength(4)
      })
      const page2 = result2.current.data.pages[0] as NostrEventDB[]
      expect(page2[0].id).toBe('4')
      expect(page2[1].id).toBe('3')
      expect(page2[2].id).toBe('2')
      expect(page2[3].id).toBe('1')
    })

    test('assert flush replies when switching from root notes to replies feed', async () => {
      const hook = ({ includeReplies }: Partial<FeedModule>) => {
        const module = useMemo(() => createModule('home_switch', { includeReplies }), [includeReplies])
        return useFeedState(module)
      }
      const options = (props: Partial<FeedModule>): RenderHookOptions<Partial<FeedModule>> => ({
        initialProps: props,
        wrapper: ({ children }) => withProviders(children),
      })

      const rootEvent = fakeEventMeta({ kind: Kind.Text, id: '1', created_at: 1 })
      const rootModule = createModule('home_switch', { includeReplies: false })
      const feedQueryKey = queryKeys.feed(rootModule.id, rootModule.filter, rootModule.ctx)
      queryClient.setQueryData(feedQueryKey, {
        pages: [[rootEvent]],
        pageParams: [undefined],
      })

      const { result, unmount } = renderHook(hook, options({ includeReplies: false }))

      await act(async () => {
        await vi.waitFor(() => {
          expect(result.current.data.pages[0]).toHaveLength(1)
        })
      })

      const rootPage = result.current.data.pages[0] as NostrEventDB[]
      expect(rootPage).toHaveLength(1)
      expect(rootPage[0].id).toBe('1')
      expect(result.current.replies).toBe(false)

      const note1 = fakeEventMeta({ kind: Kind.Text, id: '11', created_at: 1 })
      const reply1 = fakeEventMeta({ kind: Kind.Text, id: '2', created_at: 2, tags: [['e', '1', '', 'root']] })
      const reply2 = fakeEventMeta({ kind: Kind.Text, id: '3', created_at: 3, tags: [['e', '1', '', 'root']] })
      // reposts shouldn't the buffer replies counter
      const repost1 = fakeEventMeta({ kind: Kind.Repost, id: '4', content: '{}', created_at: 3, tags: [['e', '1']] })

      act(() => {
        result.current.onStream(note1)
        result.current.onStream(reply1)
        result.current.onStream(reply2)
        result.current.onStream(repost1)
      })

      await vi.waitFor(() => {
        expect(result.current.bufferTotalReplies).toBe(2)
      })

      unmount()

      const { result: result2 } = renderHook(hook, options({ includeReplies: true }))

      await vi.waitFor(() => {
        expect(result2.current.data.pages[0]).toHaveLength(1)
      })

      expect(result2.current.replies).toBe(true)
      expect(result2.current.bufferTotalReplies).toBe(0)

      const [group] = result2.current.data.pages[0] as ThreadGroup[]
      expect(group.rootId).toBe('1')

      const replyIds = group.branches.flatMap((branch) =>
        branch.items.filter((item) => item.type === 'reply').map((item) => item.eventId),
      )
      expect(replyIds).toEqual(expect.arrayContaining(['2', '3']))
    })
  })
})
