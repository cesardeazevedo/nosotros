import { Kind } from '@/constants/kinds'
import { fakeEventMeta } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { act } from '@testing-library/react'
import { delay, mergeWith, of } from 'rxjs'
import { vi } from 'vitest'
import { queryClient } from '../queryClient'
import { createEventQueryOptions } from '../useQueryBase'

const mockSubscribeStrategy = vi.fn()

vi.mock('@/hooks/subscriptions/subscribeStrategy', () => ({
  subscribeStrategy: (...args: unknown[]) => mockSubscribeStrategy(...args),
}))

describe('createEventQueryOptions', () => {
  test('assert future events', async ({ renderReactQueryHook }) => {
    const event1 = fakeEventMeta({ kind: Kind.Text, id: '1', pubkey: 'p1' })
    const event2 = fakeEventMeta({ kind: Kind.Text, id: '2', pubkey: 'p1' })
    const event3 = fakeEventMeta({ kind: Kind.Text, id: '3', pubkey: 'p1' })

    mockSubscribeStrategy.mockReturnValue(
      // from database
      of([event1]).pipe(
        // from relay
        mergeWith(of([event1, event2, event3]).pipe(delay(100))),
      ),
    )

    const result = await renderReactQueryHook(
      createEventQueryOptions({
        queryKey: ['events'],
        ctx: {},
        filter: { kinds: [1], authors: ['p1'] },
      }),
    )

    expect(result.data).toEqual([event1])
    await act(() => new Promise<void>((resolve) => setTimeout(() => resolve(), 120)))
    expect(queryClient.getQueryData(['events'])).toStrictEqual([event1, event2, event3])
  })
})
