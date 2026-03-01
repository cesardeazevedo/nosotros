import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { queryClient } from '@/hooks/query/queryClient'
import { fakeEventMeta } from '@/utils/faker'
import { createStore } from 'jotai'
import { queryClientAtom } from 'jotai-tanstack-query'
import { beforeEach, vi } from 'vitest'
import { addDeletionEventsAtom, isDeletedEventAtomFamily, userRequestDeletesQueryFamily } from '../deletion.atoms'

describe('assert deletion atoms', () => {
  test('assert adds deleted ids from e and a tags', () => {
    const store = createStore()
    const eventId = 'deleted-event-1'
    const address = '30023:pubkey:article'

    store.set(
      addDeletionEventsAtom,
      [
        fakeEventMeta({
          id: 'delete-request-1',
          kind: Kind.EventDeletion,
          tags: [
            ['e', eventId],
            ['a', address],
          ],
        }),
      ],
    )

    expect(store.get(isDeletedEventAtomFamily(eventId))).toBe(true)
    expect(store.get(isDeletedEventAtomFamily(address))).toBe(true)
  })

  test('assert ignores non-deletion events', () => {
    const store = createStore()
    const eventId = 'deleted-event-2'

    store.set(
      addDeletionEventsAtom,
      [
        fakeEventMeta({
          id: 'note-1',
          kind: Kind.Text,
          tags: [['e', eventId]],
        }),
      ],
    )

    expect(store.get(isDeletedEventAtomFamily(eventId))).toBe(false)
  })

  test('assert keeps previous deleted ids when adding new batch', () => {
    const store = createStore()
    const firstId = 'deleted-event-3'
    const secondId = 'deleted-event-4'

    store.set(
      addDeletionEventsAtom,
      [
        fakeEventMeta({
          id: 'delete-request-2',
          kind: Kind.EventDeletion,
          tags: [['e', firstId]],
        }),
      ],
    )

    store.set(
      addDeletionEventsAtom,
      [
        fakeEventMeta({
          id: 'delete-request-3',
          kind: Kind.EventDeletion,
          tags: [['e', secondId]],
        }),
      ],
    )

    expect(store.get(isDeletedEventAtomFamily(firstId))).toBe(true)
    expect(store.get(isDeletedEventAtomFamily(secondId))).toBe(true)
  })
})

describe('assert deletion atoms with mocked react query', () => {
  const mockReactQuery = vi.hoisted(() => ({
    queryData: undefined as NostrEventDB[] | undefined,
  }))

  vi.mock('@tanstack/react-query', async () => {
    const actual = await vi.importActual('@tanstack/react-query')
    return {
      ...actual,
      queryOptions: vi.fn((options: Record<string, unknown>) => {
        return {
          ...options,
          queryFn: async () => mockReactQuery.queryData || [],
        }
      }),
    }
  })

  beforeEach(() => {
    mockReactQuery.queryData = undefined
    queryClient.clear()
  })

  test('assert userRequestDeletesQueryFamily syncs query data to global deleted store', async () => {
    mockReactQuery.queryData = [
      fakeEventMeta({
        id: 'delete-request-mocked',
        kind: Kind.EventDeletion,
        tags: [['e', 'target-event-id']],
      }),
    ]

    const store = createStore()
    store.set(queryClientAtom, queryClient)
    const queryAtom = userRequestDeletesQueryFamily('pubkey')
    const unsubscribe = store.sub(queryAtom, () => { })
    store.get(queryAtom)

    await vi.waitFor(() => {
      expect(store.get(isDeletedEventAtomFamily('target-event-id'))).toBe(true)
    })

    unsubscribe()
  })
})
