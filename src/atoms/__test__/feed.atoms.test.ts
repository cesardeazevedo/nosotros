import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import { queryClient } from '@/hooks/query/queryClient'
import type { FeedModule, FeedScope } from '@/hooks/query/useQueryFeeds'
import * as feedQueryModule from '@/hooks/query/useQueryFeeds'
import { fakeEventMeta } from '@/utils/faker'
import type { NostrContext } from '@/nostr/context'
import type { QueryKey } from '@tanstack/react-query'
import { createStore } from 'jotai'
import { queryClientAtom } from 'jotai-tanstack-query'
import { vi } from 'vitest'
import { createFeedAtoms } from '../feed.atoms'
import { store } from '../store'

function createFeedModule(id: string, extras?: Partial<FeedModule>): FeedModule {
  const base: FeedModule = {
    id,
    type: 'feed',
    filter: {} as NostrFilter,
    queryKey: ['feed', id] as unknown as QueryKey,
    ctx: {} as NostrContext,
    scope: 'home' as FeedScope,
    pageSize: 10,
    autoUpdate: false,
    blured: false,
    includeReplies: undefined,
  }
  return { ...base, ...extras }
}

describe('assert feed atoms', () => {
  test('assert onStream buffers', async () => {
    queryClient.clear()
    store.set(queryClientAtom, queryClient)
    const originalCreateFeedQueryOptions = feedQueryModule.createFeedQueryOptions

    const root = fakeEventMeta({ id: 'root-1', pubkey: 'p1', kind: 1, tags: [] })
    const reply = fakeEventMeta({
      id: 'reply-1',
      pubkey: 'p2',
      kind: 1,
      tags: [['e', 'root-1', '', 'root']],
    })

    const createFeedQueryOptionsSpy = vi
      .spyOn(feedQueryModule, 'createFeedQueryOptions')
      .mockImplementation((options) =>
        originalCreateFeedQueryOptions({
          ...options,
          queryFn: async () => {
            options.onStream?.(root)
            options.onStream?.(reply)
            return [root, reply]
          },
        }),
      )

    const feedAtoms = createFeedAtoms(createFeedModule('feed/onstream-query', { autoUpdate: false }))
    const unsubscribe = store.sub(feedAtoms.query, () => { })
    store.get(feedAtoms.query)

    await vi.waitFor(() => {
      const buffer = store.get(feedAtoms.buffer) as Array<{ id: string }>
      const bufferReplies = store.get(feedAtoms.bufferReplies) as Array<{ id: string }>
      expect(buffer.map((x) => x.id)).toStrictEqual(['root-1'])
      expect(bufferReplies.map((x) => x.id)).toStrictEqual(['reply-1'])
    })

    unsubscribe()
    createFeedQueryOptionsSpy.mockRestore()
  })

  test('assert query select hides reply notes when includeReplies=false', async () => {
    const testStore = createStore()
    queryClient.clear()
    testStore.set(queryClientAtom, queryClient)
    const originalCreateFeedQueryOptions = feedQueryModule.createFeedQueryOptions
    const textRoot = fakeEventMeta({ id: 'root-1', kind: Kind.Text, tags: [] })
    const reply = fakeEventMeta({
      id: 'reply-1',
      kind: Kind.Text,
      tags: [['e', 'root-1', '', 'root']],
    })
    const repost = fakeEventMeta({ id: 'repost-1', kind: Kind.Repost, tags: [] })
    const createFeedQueryOptionsSpy = vi
      .spyOn(feedQueryModule, 'createFeedQueryOptions')
      .mockImplementation((options) =>
        originalCreateFeedQueryOptions({
          ...options,
          queryFn: async () => [textRoot, reply, repost],
        }),
      )

    const feedAtoms = createFeedAtoms(
      createFeedModule('feed/select-query', {
        includeReplies: false,
      }),
    )
    const unsubscribe = testStore.sub(feedAtoms.query, () => { })
    testStore.get(feedAtoms.query)

    await vi.waitFor(() => {
      const query = testStore.get(feedAtoms.query)
      const firstPage = query.data?.pages?.[0] || []
      expect(firstPage.map((event) => event.id)).toStrictEqual(['root-1', 'repost-1'])
    })

    unsubscribe()
    createFeedQueryOptionsSpy.mockRestore()
  })
})
