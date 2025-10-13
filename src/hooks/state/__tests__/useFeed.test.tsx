import { store } from '@/atoms/store'
import { Kind } from '@/constants/kinds'
import { queryClient } from '@/hooks/query/queryClient'
import type { FeedModule } from '@/hooks/query/useQueryFeeds'
import { test } from '@/utils/fixtures'
import type { QueryKey } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import type { RenderHookOptions } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react'
import { Provider as JotaiProvider } from 'jotai'
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
  })

  test('assert sets isEmpty=true after 4s when first page is empty', async () => {
    const module = createModule('t1')

    const { result } = renderHook(() => useFeedState(module), {
      wrapper: ({ children }) => withProviders(children),
    })

    expect(result.current.isEmpty).toBe(false)
    act(() => vi.advanceTimersByTime(6000))

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
      const module = useMemo(() => createModule('home', { includeReplies }), [includeReplies])
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
      const module = createModule('feed')
      const { result } = renderHook(() => useFeedState(module), {
        wrapper: ({ children }) => withProviders(children),
      })

      const event = fakeEventMeta({ kind: Kind.Text, id: '1', created_at: 1 })

      await act(async () => {
        queryClient.setQueryData(result.current.queryKey, {
          pages: [[event]],
          pageParams: [undefined],
        })
        await vi.waitFor(() => {
          expect(result.current.query.data?.pages[0]).toHaveLength(1)
        })
      })

      expect(result.current.query.data?.pages[0]).toHaveLength(1)
      expect(result.current.query.data?.pages[0][0].id).toBe('1')

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
        await vi.waitFor(() => {
          expect(result.current.query.data?.pages[0]).toHaveLength(4)
        })
      })

      expect(result.current.bufferTotal).toBe(0)
      expect(result.current.query.data?.pages[0][0].id).toBe('4')
      expect(result.current.query.data?.pages[0][1].id).toBe('3')
      expect(result.current.query.data?.pages[0][2].id).toBe('2')
      expect(result.current.query.data?.pages[0][3].id).toBe('1')
    })

    test('assert flush adds buffer replies to feed', async () => {
      const module = createModule('feed', { includeReplies: true })
      const { result } = renderHook(() => useFeedState(module), {
        wrapper: ({ children }) => withProviders(children),
      })

      const reply = fakeEventMeta({ kind: Kind.Text, id: '1', created_at: 1, tags: [['e', '0', '', 'root']] })

      await act(async () => {
        queryClient.setQueryData(result.current.queryKey, {
          pages: [[reply]],
          pageParams: [undefined],
        })
        await vi.waitFor(() => {
          expect(result.current.query.data?.pages[0]).toHaveLength(1)
        })
      })

      expect(result.current.query.data?.pages[0]).toHaveLength(1)
      expect(result.current.query.data?.pages[0][0].id).toBe('1')

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

      expect(result.current.bufferTotalReplies).toBe(3)

      await act(async () => {
        result.current.flush()
        await vi.waitFor(() => {
          expect(result.current.query.data?.pages[0]).toHaveLength(4)
        })
      })

      expect(result.current.bufferTotalReplies).toBe(0)
      expect(result.current.query.data?.pages[0][0].id).toBe('4')
      expect(result.current.query.data?.pages[0][1].id).toBe('3')
      expect(result.current.query.data?.pages[0][2].id).toBe('2')
      expect(result.current.query.data?.pages[0][3].id).toBe('1')
    })

    test('assert flush replies when switching from root notes to replies feed', async () => {
      const hook = ({ includeReplies }: Partial<FeedModule>) => {
        const module = useMemo(() => createModule('home', { includeReplies }), [includeReplies])
        return useFeedState(module)
      }
      const options = (props: Partial<FeedModule>): RenderHookOptions<Partial<FeedModule>> => ({
        initialProps: props,
        wrapper: ({ children }) => withProviders(children),
      })

      const { result, unmount } = renderHook(hook, options({ includeReplies: false }))

      const rootEvent = fakeEventMeta({ kind: Kind.Text, id: '1', created_at: 1 })

      await act(async () => {
        queryClient.setQueryData(result.current.queryKey, {
          pages: [[rootEvent]],
          pageParams: [undefined],
        })
        await vi.waitFor(() => {
          expect(result.current.query.data?.pages[0]).toHaveLength(1)
        })
      })

      expect(result.current.query.data?.pages[0]).toHaveLength(1)
      expect(result.current.query.data?.pages[0][0].id).toBe('1')
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

      expect(result.current.bufferTotalReplies).toBe(2)

      unmount()

      const { result: result2 } = renderHook(hook, options({ includeReplies: true }))

      await act(async () => {
        await vi.waitFor(() => {
          expect(result2.current.query.data?.pages[0]).toHaveLength(2)
        })
      })

      expect(result2.current.replies).toBe(true)
      expect(result2.current.bufferTotalReplies).toBe(0)
      expect(result2.current.query.data?.pages[0][0].id).toBe('3')
      expect(result2.current.query.data?.pages[0][1].id).toBe('2')
    })
  })
})
