import { Kind } from '@/constants/kinds'
import type { NostrContext } from '@/nostr/context'
import { fakeEventMeta } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { of } from 'rxjs'
import { vi } from 'vitest'
import { subscribeDependencies } from '../subscribeDependencies'

const mockSubscribeStrategy = vi.fn()

vi.mock('@/hooks/subscriptions/subscribeStrategy', () => ({
  subscribeStrategy: (...args: unknown[]) => mockSubscribeStrategy(...args),
}))

describe('subscribeDependencies', () => {
  test('assert prefetches related events', async () => {
    const root = fakeEventMeta({ id: 'root', kind: Kind.Text, pubkey: 'p4' })
    const parent = fakeEventMeta({ id: 'parent', kind: Kind.Text, pubkey: 'p3' })
    const quote5 = fakeEventMeta({ id: 'q5', kind: Kind.Text, pubkey: 'p2_q5' })
    const quote4 = fakeEventMeta({ id: 'q4', kind: Kind.Text, pubkey: 'p2_q4', tags: [['q', quote5.id]] })
    const quote3 = fakeEventMeta({ id: 'q3', kind: Kind.Text, pubkey: 'p2_q3', tags: [['q', quote4.id]] })
    const quote2 = fakeEventMeta({ id: 'q2', kind: Kind.Text, pubkey: 'p2_q2', tags: [['q', quote3.id]] })
    const quote = fakeEventMeta({ id: 'q1', kind: Kind.Text, pubkey: 'p2_q1', tags: [['q', quote2.id]] })
    const event = fakeEventMeta({
      id: 'e1',
      kind: Kind.Text,
      pubkey: 'p1',
      tags: [
        ['e', root.id, '', 'root'],
        ['e', parent.id, '', 'reply'],
        ['q', quote.id],
      ],
    })

    mockSubscribeStrategy
      .mockImplementationOnce(() => of([quote]))
      .mockImplementationOnce(() => of([quote2]))
      .mockImplementationOnce(() => of([quote3]))
      .mockImplementationOnce(() => of([quote4]))
      .mockImplementation(() => of([]))

    const ctx = { network: 'CACHE_FIRST' } as NostrContext
    const spy = subscribeSpyTo(of([event]).pipe(subscribeDependencies(ctx, { quotes: { depth: 4 } })))
    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([[event]])
    expect(mockSubscribeStrategy.mock.calls).toHaveLength(5)
    const [, filter0] = mockSubscribeStrategy.mock.calls[0]
    const [, filter1] = mockSubscribeStrategy.mock.calls[1]
    const [, filter2] = mockSubscribeStrategy.mock.calls[2]
    const [, filter3] = mockSubscribeStrategy.mock.calls[3]

    expect(filter0.ids).toEqual(expect.arrayContaining([quote.id]))
    expect(filter1.ids).toEqual(expect.arrayContaining([quote2.id]))
    expect(filter2.ids).toEqual(expect.arrayContaining([quote3.id]))
    expect(filter3.ids).toEqual(expect.arrayContaining([quote4.id]))
  })
})
