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
})
