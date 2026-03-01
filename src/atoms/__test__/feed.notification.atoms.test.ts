import { authAtom } from '@/atoms/auth.atoms'
import { Kind } from '@/constants/kinds'
import type { NotificationFeedModule } from '@/hooks/modules/createNotificationFeedModule'
import * as feedQueryModule from '@/hooks/query/useQueryFeeds'
import { queryClient } from '@/hooks/query/queryClient'
import { queryKeys } from '@/hooks/query/queryKeys'
import { fakeEventMeta } from '@/utils/faker'
import { createStore } from 'jotai'
import { queryClientAtom } from 'jotai-tanstack-query'
import { vi } from 'vitest'
import { createNotificationFeedAtoms } from '../feed.notification.atoms'

describe('assert notification feed atoms', () => {
  test('assert createNotificationFeedAtoms filters muted notes', async () => {
    const testStore = createStore()
    queryClient.clear()
    testStore.set(queryClientAtom, queryClient)
    testStore.set(authAtom, {
      selected: 'me',
      accounts: {
        me: { pubkey: 'me' },
      },
    })
    const createFeedQueryOptions = (
      await vi.importActual<typeof import('@/hooks/query/useQueryFeeds')>('@/hooks/query/useQueryFeeds')
    ).createFeedQueryOptions

    const mentionedRoot = fakeEventMeta({
      id: 'mention-root',
      pubkey: 'author-1',
      tags: [['p', 'me']],
    })
    const replyNote = fakeEventMeta({
      id: 'reply-1',
      pubkey: 'author-2',
      tags: [
        ['p', 'me'],
        ['e', 'mention-root', '', 'root'],
      ],
    })
    const mutedNote = fakeEventMeta({
      id: 'muted-random',
      pubkey: 'author-3',
    })
    const muteList = fakeEventMeta({
      id: 'mute-list-1',
      kind: Kind.Mutelist,
      pubkey: 'me',
      tags: [['e', 'muted-random']],
    })
    queryClient.setQueryData(queryKeys.replaceable(Kind.Mutelist, 'me'), [muteList])
    const createFeedQueryOptionsSpy = vi
      .spyOn(feedQueryModule, 'createFeedQueryOptions')
      .mockImplementation((options) =>
        createFeedQueryOptions({
          ...options,
          queryFn: async () => [mentionedRoot, mutedNote, replyNote],
        }),
      )

    const notificationAtoms = createNotificationFeedAtoms({
      id: 'notification_me',
      type: 'inbox',
      filter: {
        kinds: [Kind.Text],
        '#p': ['me'],
        limit: 50,
      },
      queryKey: ['feed', 'notification_me'],
      ctx: {},
      scope: 'self',
      pageSize: 10,
      autoUpdate: false,
      blured: false,
      includeReplies: true,
      includeMuted: false,
      includeMentions: false,
    } as NotificationFeedModule)

    const unsubscribe = testStore.sub(notificationAtoms.query, () => {})
    testStore.get(notificationAtoms.query)

    await vi.waitFor(() => {
      const data = testStore.get(notificationAtoms.data)
      const firstPage = data.pages?.[0] || []
      expect(firstPage.map((event) => event.id)).toStrictEqual(['reply-1'])
    })

    unsubscribe()
    createFeedQueryOptionsSpy.mockRestore()
  })
})
